"use client";

import type { AnalyzedRepoImpact } from "@/lib/github/analyzer";

interface RepoCardProps {
  repo: AnalyzedRepoImpact;
  index: number;
}

export function RepoCard({ repo, index }: RepoCardProps) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="animate-fade-in-up block border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 transition-[border-color,background-color] duration-100 ease-[var(--ease-smooth)] hover:border-[var(--color-accent)]"
      style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-headline text-lg font-semibold tracking-tight">{repo.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Impact Score {repo.impactScore.toFixed(1)}
          </p>
        </div>

        {repo.isPinned ? <span className="text-xs text-[var(--color-accent)]">Pinned</span> : null}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {repo.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)]">
        <span style={{ color: repo.languageColor }}>{repo.language}</span>
        <span>Stars {repo.stars}</span>
        <span>Forks {repo.forks}</span>
        <span>{repo.commitTotal} commits</span>
      </div>
    </a>
  );
}
