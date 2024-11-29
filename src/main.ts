import { readFileSync } from "fs";
import parseDiff, { File } from "parse-diff";
import minimatch from "minimatch";
import createPrompt from "./prompt";
import {
  createComments,
  createDiff,
  createReviewComment,
  getDiff,
  PRDetails,
} from "./github";
import { getPRDetails } from "./github";
import { getAIResponse } from "./openai";
import { readRules, RulesFile } from "./rules";

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
        const newComments = createComments(file, chunk, aiResponse);
        if (newComments) {
          comments.push(...newComments);
        }
      }
    }
  }
  return comments;
}

async function main() {
  console.log("Starting action");
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

    diff = await createDiff(prDetails, newBaseSha, newHeadSha);
  } else {
    console.error("Unsupported event:", process.env.GITHUB_EVENT_NAME);
    return;
  }

  if (!diff) {
    console.error("No diff found");
    return;
  }

  const parsedDiff = parseDiff(diff);
  const rules = readRules();
  const { ignore: allIgnorePatterns = [] } = rules;

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

export default main;
