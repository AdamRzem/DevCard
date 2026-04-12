"use client";

import { useEffect, useMemo, useState } from "react";

interface ProfileTerminalPanelProps {
  modeLabel: "stats" | "web" | "mobile";
}

type TerminalLineType = "success" | "warning" | "system" | "muted";

interface TerminalLine {
  id: string;
  timestamp?: string;
  tag?: string;
  text: string;
  type: TerminalLineType;
}

const modePrompts: Record<ProfileTerminalPanelProps["modeLabel"], string[]> = {
  stats: [
    "Explain my contribution streak trend",
    "Which language grew most this month?",
    "Summarize top repo impact",
  ],
  web: [
    "Show featured web projects",
    "Compare project stack choices",
    "Suggest recruiter talking points",
  ],
  mobile: [
    "Highlight strongest mobile work",
    "Summarize Android architecture",
    "Generate mobile portfolio pitch",
  ],
};

const modeLines: Record<
  ProfileTerminalPanelProps["modeLabel"],
  TerminalLine[]
> = {
  stats: [
    {
      id: "stats-1",
      text: "INITIALIZING DIAGNOSTICS STREAM...",
      type: "muted",
    },
    {
      id: "stats-2",
      timestamp: "14:02:11",
      tag: "INFO",
      text: "CONTRIBUTION KERNEL ONLINE.",
      type: "success",
    },
    {
      id: "stats-3",
      timestamp: "14:02:45",
      tag: "OKAY",
      text: "LANGUAGE INDEX READY.",
      type: "success",
    },
    {
      id: "stats-4",
      timestamp: "14:03:02",
      tag: "WARN",
      text: "STREAK TREND VOLATILITY DETECTED.",
      type: "warning",
    },
    {
      id: "stats-5",
      timestamp: "14:04:00",
      tag: "SYNC",
      text: "GITHUB CACHE REFRESH COMPLETE.",
      type: "success",
    },
    {
      id: "stats-6",
      timestamp: "14:05:12",
      tag: "SCAN",
      text: "READY FOR STATS QUERY INPUT.",
      type: "system",
    },
  ],
  web: [
    {
      id: "web-1",
      text: "INITIALIZING PROJECT ARCHIVE...",
      type: "muted",
    },
    {
      id: "web-2",
      timestamp: "11:10:08",
      tag: "INFO",
      text: "WEB PORTFOLIO ROUTES MOUNTED.",
      type: "success",
    },
    {
      id: "web-3",
      timestamp: "11:10:41",
      tag: "DATA",
      text: "REPO STRIP PREVIEWS INDEXED.",
      type: "success",
    },
    {
      id: "web-4",
      timestamp: "11:11:05",
      tag: "WARN",
      text: "LIVE ISSUE FEED NOT YET ATTACHED.",
      type: "warning",
    },
    {
      id: "web-5",
      timestamp: "11:11:33",
      tag: "SYNC",
      text: "README SIGNALS CACHED.",
      type: "success",
    },
    {
      id: "web-6",
      timestamp: "11:12:12",
      tag: "SCAN",
      text: "WHAT ARE YOU LOOKING FOR?",
      type: "system",
    },
  ],
  mobile: [
    {
      id: "mobile-1",
      text: "INITIALIZING ANDROID HUD STACK...",
      type: "muted",
    },
    {
      id: "mobile-2",
      timestamp: "09:40:31",
      tag: "INFO",
      text: "MOBILE PROJECT FEED LIVE.",
      type: "success",
    },
    {
      id: "mobile-3",
      timestamp: "09:41:10",
      tag: "DATA",
      text: "APK METRICS INGEST COMPLETE.",
      type: "success",
    },
    {
      id: "mobile-4",
      timestamp: "09:41:44",
      tag: "WARN",
      text: "EMULATOR PIPELINE DEGRADED.",
      type: "warning",
    },
    {
      id: "mobile-5",
      timestamp: "09:42:03",
      tag: "SYNC",
      text: "PLAYLIST SNAPSHOT REFRESHED.",
      type: "success",
    },
    {
      id: "mobile-6",
      timestamp: "09:42:55",
      tag: "SCAN",
      text: "READY FOR MOBILE QUERY INPUT.",
      type: "system",
    },
  ],
};

function getTagColor(type: TerminalLineType) {
  if (type === "warning") {
    return "text-[var(--color-accent)]";
  }

  if (type === "success") {
    return "text-[var(--color-signal)]";
  }

  if (type === "system") {
    return "text-[var(--color-text-primary)]";
  }

  return "text-[var(--color-text-secondary)]";
}

export function ProfileTerminalPanel({ modeLabel }: ProfileTerminalPanelProps) {
  const lines = useMemo(() => modeLines[modeLabel], [modeLabel]);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    setVisibleLines(0);
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const revealLine = (index: number) => {
      if (!active || index >= lines.length) {
        return;
      }

      setVisibleLines(index + 1);

      const delay = 120 + (index % 3) * 70;
      timeoutId = setTimeout(() => revealLine(index + 1), delay);
    };

    timeoutId = setTimeout(() => revealLine(0), 320);

    return () => {
      active = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [lines]);

  return (
    <aside className="flex h-full flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[var(--color-accent)]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-primary)]">
            TERMINAL_AI_BETA
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-signal)]">
          {modeLabel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div
          className="border border-[var(--color-border-subtle)] bg-[color:rgb(0_0_0_/_.9)] p-3"
          style={{ minHeight: "720px" }}
        >
          {lines.map((line, index) => {
            const isVisible = index < visibleLines;

            return (
              <div
                key={line.id}
                className="mb-2 flex items-start gap-2 font-mono text-[10px] uppercase tracking-[0.08em]"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(5px)",
                  transition: "opacity 120ms ease-out, transform 120ms ease-out",
                }}
              >
                {line.timestamp ? (
                  <span className="text-[color:rgb(0_255_65_/_0.4)]">{line.timestamp}</span>
                ) : (
                  <span className="text-[color:rgb(0_255_65_/_0.4)]">&gt;</span>
                )}
                {line.tag ? (
                  <span className={getTagColor(line.type)}>[{line.tag}]</span>
                ) : null}
                <span className="text-[color:rgb(229_226_225_/_0.8)]">{line.text}</span>
              </div>
            );
          })}

          <div
            className="mt-1 flex items-center gap-2 pt-1 font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{
              opacity: visibleLines >= lines.length ? 1 : 0,
              transition: "opacity 120ms ease-out",
            }}
          >
            <span className="text-[var(--color-signal)]">&gt;</span>
            <span className="inline-block h-3 w-2 animate-pulse bg-[var(--color-signal)]" />
          </div>

          <div className="my-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-signal)]">
              CORE_TEMP: 34C
            </p>
            <div className="mt-1 h-1 w-full bg-[var(--color-bg-secondary)]">
              <div className="h-full w-2/3 bg-[var(--color-signal)]" />
            </div>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-signal)]">
              MEMORY_USAGE: 4.2GB / 16GB
            </p>
            <div className="mt-1 h-1 w-full bg-[var(--color-bg-secondary)]">
              <div className="h-full w-[85%] bg-[var(--color-accent)]" />
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-signal)]">
            STATUS: ENCRYPTED_CONNECTED
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {modePrompts[modeLabel].map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]"
              title="AI integration is planned for a later phase"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-signal)]">
            &gt;
          </span>
          <input
            value=""
            readOnly
            disabled
            placeholder="Chat transport will be connected later"
            className="w-full bg-transparent font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>
    </aside>
  );
}
