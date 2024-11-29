import { describe, test, expect } from "vitest";
import { Chunk, File } from "parse-diff";
import { PRDetails } from "./github";
import { RulesFile } from "./rules";
import createPrompt from "./prompt";

describe("createPrompt", () => {
  test("should generate a prompt with the correct format", () => {
    const file: File = {
      from: "file1.ts",
      to: "file1.ts",
      chunks: [],
      deletions: 0,
      additions: 0,
    };

    const chunk: Chunk = {
      content: "@@ -1,3 +1,9 @@",
      changes: [
        { type: "add", add: true, ln: 1, content: "+const a = 1;" },
        { type: "add", add: true, ln: 2, content: "+const b = 2;" },
      ],
      oldStart: 1,
      oldLines: 3,
      newStart: 1,
      newLines: 9,
    };

    const prDetails: PRDetails = {
      title: "Add new constants",
      description: "This PR adds two new constants.",
      owner: "owner",
      repo: "repo",
      pull_number: 1,
    };

    const rules: RulesFile = {
      global: ["No magic numbers", "Use const for constants"],
      ignore: [],
      directories: [],
      extensions: [],
    };

    const prompt = createPrompt(file, chunk, prDetails, rules);

    expect(`Your task is to review pull requests. Instructions:
- Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]}
- Do not give positive comments or compliments.
- Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.

Review the following code diff in the file "file1.ts" and take the pull request title and description into account when writing the response.

IMPORTANT: Always leave a comment if any of the following rules are broken:
  No magic numbers
Use const for constants
  
Pull request title: Add new constants
Pull request description:

---
This PR adds two new constants.
---

Git diff to review:

\`\`\`diff
@@ -1,3 +1,9 @@
1 +const a = 1;
2 +const b = 2;
\`\`\`
`).toEqual(prompt);

    expect(prompt).toContain("Your task is to review pull requests.");
    expect(prompt).toContain("Add new constants");
    expect(prompt).toContain("This PR adds two new constants.");
    expect(prompt).toContain("No magic numbers");
    expect(prompt).toContain("Use const for constants");
    expect(prompt).toContain("Git diff to review:");
    expect(prompt).toContain("+const a = 1;");
    expect(prompt).toContain("+const b = 2;");
  });
});
