import { readFileSync } from "fs";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { Chunk, File } from "parse-diff";
import { AIReviewLine } from "./openai";

const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export interface PRDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  description: string;
}

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
  const response = (await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  })) as unknown as { data: string };
  return response.data;
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

async function createDiff(
  prDetails: PRDetails,
  newBaseSha: string,
  newHeadSha: string
) {
  const response = await octokit.repos.compareCommits({
    headers: {
      accept: "application/vnd.github.v3.diff",
    },
    owner: prDetails.owner,
    repo: prDetails.repo,
    base: newBaseSha,
    head: newHeadSha,
  });

  return String(response.data);
}

function createComments(
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

export {
  getPRDetails,
  getDiff,
  createReviewComment,
  createDiff,
  createComments,
};
