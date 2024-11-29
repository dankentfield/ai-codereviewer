import { Chunk, File } from "parse-diff";
import type { PRDetails } from "./github";
import { getApplicableRules } from "./rules";
import type { RulesFile } from "./rules";

function createPrompt(
  file: File,
  chunk: Chunk,
  prDetails: PRDetails,
  rules: RulesFile
): string {
  const applicableRules = getApplicableRules(rules, file);

  const prompt = `Your task is to review pull requests. Instructions:
- Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]}
- Do not give positive comments or compliments.
- Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.

Review the following code diff in the file "${
    file.to
  }" and take the pull request title and description into account when writing the response.

IMPORTANT: Always leave a comment if any of the following rules are broken:
  ${applicableRules.join("\n")}
  
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

  return prompt;
}

export default createPrompt;
