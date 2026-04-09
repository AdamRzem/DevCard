import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { saveUser } from "@/lib/aws/dynamodb";
import {
  analyzeProfile,
  type AnalyzeProfileResult,
  type AnalyzerRepoInput,
} from "@/lib/github/analyzer";
import { GitHubApiError } from "@/lib/github/errors";
import {
  fetchContributions,
  fetchProfile,
  fetchTopRepos,
  type GitHubRepository,
} from "@/lib/github/graphql";
import { fetchRepoLanguages, fetchRepoStats } from "@/lib/github/rest";
import type {
  GitHubSyncPersistenceMeta,
  GitHubSyncSuccessResponse,
} from "@/lib/github/sync-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REPOS_FOR_ENRICHMENT = 12;
const REPO_ENRICHMENT_CONCURRENCY = 4;
const DEV_SYNC_SECRET_HEADER = "x-dev-sync-secret";
const DEV_GITHUB_TOKEN_HEADER = "x-dev-github-token";
const DEV_GITHUB_LOGIN_HEADER = "x-dev-github-login";

// Template: add repositories you want to exclude from dashboard analytics.
// Format is "owner/repository" in lowercase.
// Example: "adamrzem/my-django-repo"
const EXCLUDED_REPO_FULL_NAMES = new Set<string>([
  "adamrzem/django4p2",
]);

type UniqueRepoEntry = {
  repository: GitHubRepository;
  isPinned: boolean;
};

type SyncAuthContext = {
  accessToken: string;
  username: string;
  authMode: "session" | "dev-bypass";
};

function hasValue(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function toRepoFullName(owner: string, repository: string) {
  return `${owner}/${repository}`.toLowerCase();
}

function isAllowedDevBypassHost(hostHeader: string) {
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(hostHeader.trim());
}

function getDevBypassContext(request: Request): SyncAuthContext | null {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (process.env.ENABLE_DEV_SYNC_BYPASS !== "true") {
    return null;
  }

  const host = request.headers.get("host") ?? "";
  if (!isAllowedDevBypassHost(host)) {
    return null;
  }

  const bypassSecret = process.env.DEV_SYNC_BYPASS_SECRET;
  const providedSecret = request.headers.get(DEV_SYNC_SECRET_HEADER);

  if (!hasValue(bypassSecret) || !hasValue(providedSecret) || providedSecret !== bypassSecret) {
    return null;
  }

  const headerToken = request.headers.get(DEV_GITHUB_TOKEN_HEADER);
  const headerLogin = request.headers.get(DEV_GITHUB_LOGIN_HEADER);

  const accessToken = hasValue(headerToken) ? headerToken : process.env.DEV_GITHUB_TOKEN;
  const username = hasValue(headerLogin) ? headerLogin : process.env.DEV_GITHUB_LOGIN;

  if (!hasValue(accessToken) || !hasValue(username)) {
    return null;
  }

  return {
    accessToken: accessToken!,
    username: username!,
    authMode: "dev-bypass",
  };
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function collectUniqueRepos(
  pinned: GitHubRepository[],
  top: GitHubRepository[],
): UniqueRepoEntry[] {
  const combined: UniqueRepoEntry[] = [
    ...pinned.map((repository) => ({ repository, isPinned: true })),
    ...top.map((repository) => ({ repository, isPinned: false })),
  ];

  const map = new Map<string, UniqueRepoEntry>();

  for (const entry of combined) {
    const key = `${entry.repository.ownerLogin.toLowerCase()}/${entry.repository.name.toLowerCase()}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, entry);
      continue;
    }

    if (entry.isPinned && !existing.isPinned) {
      map.set(key, {
        ...existing,
        isPinned: true,
      });
    }
  }

  return Array.from(map.values()).sort((left, right) => {
    if (left.isPinned !== right.isPinned) {
      return Number(right.isPinned) - Number(left.isPinned);
    }

    return right.repository.stargazerCount - left.repository.stargazerCount;
  });
}

async function enrichRepository(
  token: string,
  entry: UniqueRepoEntry,
): Promise<AnalyzerRepoInput> {
  const [languagesResult, statsResult] = await Promise.allSettled([
    fetchRepoLanguages(token, entry.repository.ownerLogin, entry.repository.name),
    fetchRepoStats(token, entry.repository.ownerLogin, entry.repository.name),
  ]);

  return {
    repository: entry.repository,
    languages: languagesResult.status === "fulfilled" ? languagesResult.value : {},
    commitActivity: statsResult.status === "fulfilled" ? statsResult.value : null,
    isPinned: entry.isPinned,
  };
}

async function mapWithConcurrency<TInput, TResult>(
  values: TInput[],
  concurrency: number,
  worker: (value: TInput) => Promise<TResult>,
): Promise<TResult[]> {
  const results = new Array<TResult>(values.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, async () => {
      while (nextIndex < values.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(values[currentIndex]);
      }
    }),
  );

  return results;
}

export async function POST(request: Request) {
  const devBypass = getDevBypassContext(request);
  const session = devBypass ? null : await auth();
  const accessToken = devBypass?.accessToken ?? session?.accessToken;
  const username = devBypass?.username ?? session?.user?.githubLogin;
  const githubId = devBypass ? undefined : session?.githubId;
  const authMode = devBypass?.authMode ?? "session";

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Unauthorized. Sign in with GitHub first.",
      },
      { status: 401 },
    );
  }

  if (!username) {
    return NextResponse.json(
      {
        error: "GitHub username is missing in session. Sign out and sign in again.",
      },
      { status: 400 },
    );
  }

  try {
    const [contributions, profile, repoCollections] = await Promise.all([
      fetchContributions(accessToken, username),
      fetchProfile(accessToken, username),
      fetchTopRepos(accessToken, username),
    ]);

    const uniqueRepos = collectUniqueRepos(repoCollections.pinned, repoCollections.top);
    const filteredRepos = uniqueRepos.filter(
      (entry) =>
        !EXCLUDED_REPO_FULL_NAMES.has(
          toRepoFullName(entry.repository.ownerLogin, entry.repository.name),
        ),
    );

    const totalStarsAcrossCandidates = filteredRepos.reduce(
      (sum, entry) => sum + entry.repository.stargazerCount,
      0,
    );
    const reposToEnrich = filteredRepos.slice(0, MAX_REPOS_FOR_ENRICHMENT);
    const enrichedRepos = await mapWithConcurrency(
      reposToEnrich,
      REPO_ENRICHMENT_CONCURRENCY,
      (entry) => enrichRepository(accessToken, entry),
    );

    const analyzed = analyzeProfile({
      profile,
      contributions,
      repos: enrichedRepos,
    });

    const responseData: AnalyzeProfileResult = {
      ...analyzed,
      totalStars: totalStarsAcrossCandidates,
    };

    const fetchedAt = new Date().toISOString();
    let persistence: GitHubSyncPersistenceMeta | undefined;

    if (authMode === "dev-bypass") {
      persistence = {
        status: "skipped",
        reason: "Development bypass mode does not persist sync results.",
      };
    } else if (!githubId) {
      persistence = {
        status: "skipped",
        reason: "GitHub account identifier is missing in session.",
      };
    } else if (profile.login.toLowerCase() !== username.toLowerCase()) {
      persistence = {
        status: "failed",
        reason: "Fetched GitHub login does not match the authenticated session.",
      };
    } else {
      try {
        const saveResult = await saveUser({
          githubId,
          githubUsername: username,
          displayName: profile.name,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          githubData: responseData,
          lastFetchedAt: fetchedAt,
        });

        persistence =
          saveResult.status === "written"
            ? {
                status: "written",
              }
            : {
                status: saveResult.status,
                reason: saveResult.reason,
              };
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          console.error("GitHub sync persistence failed.", {
            githubId,
            githubUsername: username,
            detail: toErrorMessage(error),
          });
        }

        persistence = {
          status: "failed",
          reason:
            process.env.NODE_ENV === "production"
              ? "GitHub data was fetched but persistence failed."
              : toErrorMessage(error),
        };
      }
    }

    const payload: GitHubSyncSuccessResponse = {
      data: responseData,
      meta: {
        fetchedAt,
        githubLogin: username,
        authMode,
        enrichedRepoCount: reposToEnrich.length,
        totalCandidateRepos: filteredRepos.length,
        repoEnrichmentCapped: filteredRepos.length > MAX_REPOS_FOR_ENRICHMENT,
        enrichmentConcurrency: REPO_ENRICHMENT_CONCURRENCY,
        persistence,
      },
    };

    if (persistence?.status === "failed" && process.env.NODE_ENV === "production") {
      const responseBody =
        {
          error: "GitHub data fetched but persistence failed. Retry sync.",
        };

      return NextResponse.json(responseBody, { status: 503 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof GitHubApiError) {
      if (error.status === 401) {
        return NextResponse.json(
          {
            error: "GitHub session expired. Sign out and sign in again.",
          },
          { status: 401 },
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          {
            error: "GitHub API rate limit reached. Retry in a few minutes.",
          },
          { status: 429 },
        );
      }

      if (error.status === 403) {
        return NextResponse.json(
          {
            error: "GitHub API access denied for this token or session.",
          },
          { status: 403 },
        );
      }

      if (error.status === 404) {
        return NextResponse.json(
          {
            error: "GitHub profile could not be found for this session.",
          },
          { status: 404 },
        );
      }

      if (error.status === 504) {
        return NextResponse.json(
          {
            error: "GitHub API timed out. Please try again.",
          },
          { status: 504 },
        );
      }
    }

    const responseBody =
      process.env.NODE_ENV === "production"
        ? {
            error: "GitHub sync failed. Verify OAuth setup and try again.",
          }
        : {
            error: "GitHub sync failed. Verify OAuth setup and try again.",
            detail: toErrorMessage(error),
          };

    return NextResponse.json(
      responseBody,
      { status: 502 },
    );
  }
}
