import { readFileSync } from "fs";
import * as core from "@actions/core";
import OpenAI from "openai";
import { Octokit } from "@octokit/rest";
import parseDiff, { Chunk, File } from "parse-diff";
import minimatch from "minimatch";
import { parse, stringify } from 'yaml'

const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");
const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL") || "gpt-4o";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface PRDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  description: string;
}

console.log("Running")

async function getPRDetails(): Promise<PRDetails> {
  const { repository, number } = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
  );
  const prResponse = await octokit.pulls.get({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
  });
  return {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
    title: prResponse.data.title ?? "",
    description: prResponse.data.body ?? "",
  };
}

async function getDiff(
  owner: string,
  repo: string,
  pull_number: number
): Promise<string | null> {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });
  // @ts-expect-error - response.data is a string
  return response.data;
}

async function analyzeCode(
  parsedDiff: File[],
  prDetails: PRDetails,
  rules: RulesFile
): Promise<Array<{ body: string; path: string; line: number }>> {
  const comments: Array<{ body: string; path: string; line: number }> = [];

  for (const file of parsedDiff) {
    if (file.to === "/dev/null") continue; // Ignore deleted files
    for (const chunk of file.chunks) {
      const prompt = createPrompt(file, chunk, prDetails, rules);
      const aiResponse = await getAIResponse(prompt);
      if (aiResponse) {
        const newComments = createComment(file, chunk, aiResponse);
        if (newComments) {
          comments.push(...newComments);
        }
      }
    }
  }
  return comments;
}

function getApplicableRules(rules: RulesFile, file: File): string[] {
  const {extensions, directories, global} = rules;
  
  const extensionsKeys = Object.keys(extensions);
  const applicableExtensionKeys = extensionsKeys.filter((key: string) => file.to?.endsWith(key));
  const extensionRules = applicableExtensionKeys.flatMap((key: string) => extensions[key]);

  const directoriesKeys = Object.keys(directories);
  const applicableDirectoriesKeys = directoriesKeys.filter((key: string) => 
    file.to ? minimatch(file.to, key) : false
  );
  const directoryRules = applicableDirectoriesKeys.flatMap((key: string) => directories[key]);

  return [...global, ...extensionRules, ...directoryRules];
}

interface AIReviewLine {
  lineNumber: string;
  reviewComment: string;
  path: string;
}

function createPrompt(file: File, chunk: Chunk, prDetails: PRDetails, rules: RulesFile): string {
  const applicableRules = getApplicableRules(rules, file);

  return `Your task is to review pull requests. Instructions:
- Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]}
- Do not give positive comments or compliments.
- Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.

Review the following code diff in the file "${file.to
    }" and take the pull request title and description into account when writing the response.

${applicableRules.length ?? 
(`Always check the following rules to write the review:
  ${applicableRules.join("\n")}
`)}    
  
Pull request title: ${prDetails.title}
Pull request description:

---
${prDetails.description}
---

Git diff to review:

\`\`\`diff
${chunk.content}
${chunk.changes
      // @ts-expect-error - ln and ln2 exists where needed
      .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
      .join("\n")}
\`\`\`
`;
}

async function getAIResponse(prompt: string): Promise<Array<AIReviewLine> | null> {
  const queryConfig = {
    model: OPENAI_API_MODEL,
    temperature: 0.2,
    max_tokens: 700,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const response = await openai.chat.completions.create({
      ...queryConfig,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const res = response.choices[0].message?.content?.trim() || "{}";
    return JSON.parse(res).reviews;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function createComment(
  file: File,
  chunk: Chunk,
  aiResponses: Array<AIReviewLine>
): Array<{ body: string; path: string; line: number }> {
  return aiResponses.flatMap((aiResponse: AIReviewLine) => {
    if (!file.to) {
      return [];
    }
    return {
      body: aiResponse.reviewComment,
      path: file.to,
      line: Number(aiResponse.lineNumber),
    };
  });
}

async function createReviewComment(
  owner: string,
  repo: string,
  pull_number: number,
  comments: Array<{ body: string; path: string; line: number }>
): Promise<void> {
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    comments,
    event: "COMMENT",
  });
}

async function main() {
  const prDetails = await getPRDetails();
  let diff: string | null;
  const eventData = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
  );

  if (eventData.action === "opened") {
    diff = await getDiff(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number
    );
  } else if (eventData.action === "synchronize") {
    const newBaseSha = eventData.before;
    const newHeadSha = eventData.after;

    const response = await octokit.repos.compareCommits({
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
      owner: prDetails.owner,
      repo: prDetails.repo,
      base: newBaseSha,
      head: newHeadSha,
    });

    diff = String(response.data);
  } else {
    console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
    return;
  }

  if (!diff) {
    console.log("No diff found");
    return;
  }

  const parsedDiff = parseDiff(diff);

  const rulesFiles = core
    .getInput("config-file")
    .trim();

  const rules = readRules(rulesFiles);
  const {ignore: allIgnorePatterns = []} = rules;

  const filteredDiff = parsedDiff.filter((file) => {
    return !allIgnorePatterns.some((pattern) =>
      minimatch(file.to ?? "", pattern)
    );
  });

  const comments = await analyzeCode(filteredDiff, prDetails, rules);
  if (comments.length > 0) {
    await createReviewComment(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number,
      comments
    );
  }
}

interface RulesFile {
  directories: Record<string, string[]>;
  extensions: Record<string, string[]>;
  global: Array<string>;
  ignore: Array<string>;
}

function readRules(fileContents: string): RulesFile {
    const parsed = parse(fileContents, { mapAsMap: true });
    
    // Transform the parsed Map into a plain object
    const rules: RulesFile = {
        global: parsed.get('global') || [],
        extensions: {},
        directories: {},
        ignore: parsed.get('ignore') || []
    };

    // Handle extensions map
    const extensionsMap = parsed.get('extensions');
    if (extensionsMap instanceof Map) {
        for (const [key, value] of extensionsMap.entries()) {
            // If key is an array, create an entry for each extension
            if (Array.isArray(key)) {
                key.forEach(ext => {
                    rules.extensions[ext] = value;
                });
            } else {
                rules.extensions[key] = value;
            }
        }
    }

    // Handle directories map
    const directoriesMap = parsed.get('directories');
    if (directoriesMap instanceof Map) {
        for (const [key, value] of directoriesMap.entries()) {
            rules.directories[key] = value;
        }
    }

    return rules;
}

export { readRules, getApplicableRules };
export default main;
