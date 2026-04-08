import type { AnalyzeProfileResult } from "@/lib/github/analyzer";

export type GitHubSyncMeta = {
  fetchedAt: string;
  githubLogin: string;
  authMode: "session" | "dev-bypass";
  enrichedRepoCount: number;
  totalCandidateRepos: number;
  repoEnrichmentCapped: boolean;
  enrichmentConcurrency: number;
};

export type GitHubSyncSuccessResponse = {
  data: AnalyzeProfileResult;
  meta: GitHubSyncMeta;
};

export type GitHubSyncErrorResponse = {
  error: string;
  detail?: string;
};
