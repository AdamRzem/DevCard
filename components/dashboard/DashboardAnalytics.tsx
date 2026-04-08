"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AnalyzeProfileResult } from "@/lib/github/analyzer";
import type {
  GitHubSyncErrorResponse,
  GitHubSyncMeta,
  GitHubSyncSuccessResponse,
} from "@/lib/github/sync-contract";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { LanguageChart } from "@/components/dashboard/LanguageChart";
import { RepoCard } from "@/components/dashboard/RepoCard";

const SYNC_CACHE_KEY_PREFIX = "devcard-dashboard-sync-cache";
const SYNC_CACHE_TTL_MS = 5 * 60 * 1000;

type SyncCacheRecord = {
  savedAt: number;
  payload: GitHubSyncSuccessResponse;
};

interface DashboardAnalyticsProps {
  githubLogin: string | null;
}

function normalizeSyncError(status: number, message?: string) {
  if (status === 401) {
    return "GitHub session expired. Reconnect GitHub to continue.";
  }

  if (status === 429) {
    return "GitHub API rate limit reached. Please retry in a few minutes.";
  }

  if (status === 403) {
    return "GitHub denied access for the current token/session.";
  }

  if (status === 400) {
    return "GitHub session data is incomplete. Sign out and sign in again.";
  }

  if (status === 404) {
    return "GitHub profile could not be found for this account.";
  }

  return message ?? "Could not load dashboard analytics right now.";
}

function formatFetchedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(date);
}

function removeSyncCache(cacheKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(cacheKey);
  } catch {
    // Ignore storage failures.
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isSyncSuccessResponse(value: unknown): value is GitHubSyncSuccessResponse {
  if (!isObject(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const data = candidate.data;
  const meta = candidate.meta;

  if (!isObject(data) || !isObject(meta)) {
    return false;
  }

  return Boolean(
    typeof meta.fetchedAt === "string" &&
      typeof meta.githubLogin === "string" &&
      (meta.authMode === "session" || meta.authMode === "dev-bypass") &&
      typeof meta.enrichedRepoCount === "number" &&
      typeof meta.totalCandidateRepos === "number" &&
      typeof meta.repoEnrichmentCapped === "boolean" &&
      typeof meta.enrichmentConcurrency === "number" &&
      typeof data.totalContributions === "number" &&
      typeof data.publicRepos === "number" &&
      typeof data.totalStars === "number" &&
      isObject(data.streakData) &&
      typeof data.streakData.current === "number" &&
      typeof data.streakData.longest === "number" &&
      Array.isArray(data.topLanguages) &&
      Array.isArray(data.topRepos) &&
      Array.isArray(data.contributionCalendar),
  );
}

function readSyncCache(cacheKey: string, githubLogin: string | null): SyncCacheRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(cacheKey);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as SyncCacheRecord;
    if (!parsed || typeof parsed.savedAt !== "number" || !isSyncSuccessResponse(parsed.payload)) {
      removeSyncCache(cacheKey);
      return null;
    }

    if (
      githubLogin &&
      parsed.payload.meta.githubLogin.toLowerCase() !== githubLogin.toLowerCase()
    ) {
      removeSyncCache(cacheKey);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeSyncCache(cacheKey: string, payload: GitHubSyncSuccessResponse) {
  if (typeof window === "undefined") {
    return;
  }

  const record: SyncCacheRecord = {
    savedAt: Date.now(),
    payload,
  };

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(record));
  } catch {
    // Ignore storage failures.
  }
}

export function DashboardAnalytics({ githubLogin }: DashboardAnalyticsProps) {
  const cacheKey = `${SYNC_CACHE_KEY_PREFIX}:${(githubLogin ?? "session").toLowerCase()}`;
  const [data, setData] = useState<AnalyzeProfileResult | null>(null);
  const [meta, setMeta] = useState<GitHubSyncMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

  const loadAnalytics = useCallback(async (options?: { forceRefresh?: boolean }) => {
    const forceRefresh = options?.forceRefresh ?? false;

    if (!forceRefresh) {
      const cached = readSyncCache(cacheKey, githubLogin);
      if (cached && Date.now() - cached.savedAt <= SYNC_CACHE_TTL_MS) {
        setData(cached.payload.data);
        setMeta(cached.payload.meta);
        setError(null);
        setErrorStatus(null);
        setLoading(false);
        return;
      }
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const response = await fetch("/api/github/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (!response.ok) {
        const payload = (await response
          .json()
          .catch(() => ({ error: "GitHub sync request failed." }))) as GitHubSyncErrorResponse;
        setErrorStatus(response.status);
        setError(normalizeSyncError(response.status, payload.error));
        return;
      }

      const payload = await response.json();
      if (!isSyncSuccessResponse(payload)) {
        setErrorStatus(502);
        setError("Dashboard response shape is invalid. Please retry sync.");
        return;
      }

      setData(payload.data);
      setMeta(payload.meta);
      writeSyncCache(cacheKey, payload);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setErrorStatus(500);
      setError("Dashboard analytics request failed. Check your connection and retry.");
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, githubLogin]);

  useEffect(() => {
    void loadAnalytics();

    return () => {
      requestControllerRef.current?.abort();
    };
  }, [loadAnalytics]);

  if (loading && !data) {
    return (
      <section className="space-y-4">
        <div className="animate-fade-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`stats-skeleton-${index}`}
              className="glass animate-pulse rounded-2xl p-5"
            >
              <div className="h-4 w-24 rounded bg-[var(--color-bg-tertiary)]" />
              <div className="mt-3 h-8 w-20 rounded bg-[var(--color-bg-tertiary)]" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="glass animate-pulse min-h-[320px] rounded-3xl" />
          <div className="glass animate-pulse min-h-[320px] rounded-3xl" />
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="glass rounded-3xl p-6 sm:p-8">
        <Badge tone="warning">Sync Error</Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          Could not load GitHub analytics
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
          {error ?? "Unknown dashboard error."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void loadAnalytics({ forceRefresh: true })}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Sync"}
          </Button>
          {errorStatus === 401 ? (
            <Button href="/api/auth/signin?callbackUrl=%2Fdashboard" variant="secondary">
              Reconnect GitHub
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">Live GitHub Sync</Badge>
          {meta?.repoEnrichmentCapped ? (
            <Badge tone="warning">Repo enrichment capped for speed</Badge>
          ) : null}
        </div>

        {meta ? (
          <p className="text-xs text-[var(--color-text-muted)]">
            Last fetched {formatFetchedAt(meta.fetchedAt)} · {meta.enrichedRepoCount}/
            {meta.totalCandidateRepos} repos enriched
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-[hsla(36_92%_60%_/_0.42)] bg-[hsla(36_92%_60%_/_0.14)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
          <p>{error}</p>
          {errorStatus === 401 ? (
            <div className="mt-3">
              <Button href="/api/auth/signin?callbackUrl=%2Fdashboard" variant="secondary" size="sm">
                Reconnect GitHub
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Contributions"
          value={data.totalContributions}
          icon="C"
        />
        <StatCard
          label="Public Repositories"
          value={data.publicRepos}
          icon="R"
        />
        <StatCard
          label="Top Repo Stars"
          value={data.totalStars}
          icon="S"
        />
        <StatCard
          label="Current Streak"
          value={data.streakData.current}
          suffix=" d"
          icon="Stk"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ContributionHeatmap
          weeks={data.contributionCalendar}
          totalContributions={data.totalContributions}
        />
        <LanguageChart languages={data.topLanguages} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Top Repositories</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadAnalytics({ forceRefresh: true })}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {data.topRepos.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.topRepos.map((repo, index) => (
              <RepoCard key={repo.name} repo={repo} index={index} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            No repositories available for summary yet.
          </p>
        )}
      </section>
    </section>
  );
}
