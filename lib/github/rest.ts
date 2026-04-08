import { GitHubApiError } from "@/lib/github/errors";

const GITHUB_REST_ENDPOINT = "https://api.github.com";
const GITHUB_REQUEST_TIMEOUT_MS = 12_000;

export type RepoLanguagesBreakdown = Record<string, number>;

export interface RepoCommitWeek {
  total: number;
  week: number;
  days: number[];
}

export type RepoCommitActivity = RepoCommitWeek[] | null;

async function parseRestError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    return response.statusText;
  }

  return response.statusText;
}

function buildHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dev-card-app",
  };
}

function isTimeoutLike(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

function toCommitWeek(entry: unknown): RepoCommitWeek | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const candidate = entry as {
    total?: unknown;
    week?: unknown;
    days?: unknown;
  };

  if (
    typeof candidate.total !== "number" ||
    !Number.isFinite(candidate.total) ||
    typeof candidate.week !== "number" ||
    !Number.isFinite(candidate.week) ||
    !Array.isArray(candidate.days)
  ) {
    return null;
  }

  const days = candidate.days
    .map((value) => (typeof value === "number" && Number.isFinite(value) ? value : 0))
    .slice(0, 7);

  while (days.length < 7) {
    days.push(0);
  }

  return {
    total: candidate.total,
    week: candidate.week,
    days,
  };
}

export async function fetchRepoLanguages(
  token: string,
  owner: string,
  repo: string,
): Promise<RepoLanguagesBreakdown> {
  let response: Response;

  try {
    response = await fetch(
      `${GITHUB_REST_ENDPOINT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
      {
        method: "GET",
        headers: buildHeaders(token),
        cache: "no-store",
        signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
      },
    );
  } catch (error) {
    if (isTimeoutLike(error)) {
      throw new GitHubApiError(504, `Language request timed out for ${owner}/${repo}.`);
    }

    throw new GitHubApiError(
      502,
      `Language request failed before receiving a response for ${owner}/${repo}.`,
    );
  }

  if (response.status === 404 || response.status === 204) {
    return {};
  }

  if (!response.ok) {
    const errorText = await parseRestError(response);
    throw new GitHubApiError(
      response.status,
      `Could not fetch languages for ${owner}/${repo} (${response.status}): ${errorText}`,
    );
  }

  const payload = (await response.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  const breakdown: RepoLanguagesBreakdown = {};

  for (const [language, bytes] of entries) {
    if (typeof bytes === "number" && Number.isFinite(bytes) && bytes >= 0) {
      breakdown[language] = bytes;
    }
  }

  return breakdown;
}

export async function fetchRepoStats(
  token: string,
  owner: string,
  repo: string,
): Promise<RepoCommitActivity> {
  let response: Response;

  try {
    response = await fetch(
      `${GITHUB_REST_ENDPOINT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`,
      {
        method: "GET",
        headers: buildHeaders(token),
        cache: "no-store",
        signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
      },
    );
  } catch (error) {
    if (isTimeoutLike(error)) {
      throw new GitHubApiError(504, `Commit stats request timed out for ${owner}/${repo}.`);
    }

    throw new GitHubApiError(
      502,
      `Commit stats request failed before receiving a response for ${owner}/${repo}.`,
    );
  }

  if (response.status === 202 || response.status === 204 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await parseRestError(response);
    throw new GitHubApiError(
      response.status,
      `Could not fetch commit stats for ${owner}/${repo} (${response.status}): ${errorText}`,
    );
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    return null;
  }

  const weeks = payload
    .map((entry) => toCommitWeek(entry))
    .filter((entry): entry is RepoCommitWeek => Boolean(entry));

  return weeks.length > 0 ? weeks : null;
}
