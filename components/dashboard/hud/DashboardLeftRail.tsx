"use client";

import { usePathname } from "next/navigation";

import {
  StatsRailNav,
  type StatsRailSection,
} from "@/components/dashboard/stats/StatsRailNav";

const statsSections: StatsRailSection[] = [
  { id: "languages", label: "MOST_USED_LANGUAGES" },
  { id: "commits-per-day", label: "COMMITS_PER_DAY" },
  { id: "contribution-heatmap", label: "CONTRIBUTION_HEATMAP" },
  { id: "top-repositories", label: "TOP_REPOSITORIES" },
];

const pageAnchors = {
  web: [
    { id: "web-featured", label: "FEATURED" },
    { id: "web-open-source", label: "OPEN_SOURCE" },
    { id: "web-experiments", label: "EXPERIMENTS" },
  ],
  mobile: [
    { id: "android-frame", label: "ANDROID_FRAME" },
    { id: "ai-diagnostics", label: "AI_DIAGNOSTICS" },
    { id: "intent-protocol", label: "INTENT_PROTOCOL" },
  ],
  editor: [
    { id: "card-editor-form", label: "CARD_EDITOR_FORM" },
    { id: "card-editor-result", label: "PUBLISHED_CARD_DATA" },
  ],
} as const;

export function DashboardLeftRail() {
  const pathname = usePathname();
  const mode = pathname.endsWith("/web")
    ? "web"
    : pathname.endsWith("/mobile")
      ? "mobile"
      : pathname.endsWith("/editor")
        ? "editor"
        : "stats";

  return (
    <aside className="hidden border-r border-[var(--color-border)] bg-[var(--color-bg-tertiary)] lg:flex lg:w-64 lg:flex-col">
      <div className="border-b border-[var(--color-border)] px-5 py-5">
        <p className="font-headline text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          NODE_01
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
          V.2.0.48
        </p>
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="border-t border-[var(--color-border)] pt-4">
          {mode === "stats" ? (
            <StatsRailNav sections={statsSections} />
          ) : (
            <nav aria-label="Page sections" className="space-y-1">
              {pageAnchors[mode].map((anchor) => (
                <a
                  key={anchor.id}
                  href={`#${anchor.id}`}
                  className="block border-l border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] transition-colors duration-100 hover:border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                >
                  {anchor.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          HUD_STATUS: ONLINE
        </p>
      </div>
    </aside>
  );
}
