"use client";

import { useMemo } from "react";

type ContributionDay = {
  contributionCount: number;
  date: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

interface CommitsPerDayChartProps {
  weeks: ContributionWeek[];
}

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function toUtcWeekdayIndex(isoDate: string) {
  const parsed = new Date(`${isoDate}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getUTCDay();
}

export function CommitsPerDayChart({ weeks }: CommitsPerDayChartProps) {
  const weekdayTotals = useMemo(() => {
    const totals = Array<number>(7).fill(0);

    for (const week of weeks) {
      for (const day of week.contributionDays) {
        const weekdayIndex = toUtcWeekdayIndex(day.date);

        if (weekdayIndex === null) {
          continue;
        }

        totals[weekdayIndex] += day.contributionCount;
      }
    }

    return totals;
  }, [weeks]);

  const peakValue = Math.max(...weekdayTotals, 1);

  return (
    <article className="hud-panel scroll-mt-28 p-6 sm:p-7" id="commits-per-day" data-stats-section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-headline text-2xl font-semibold tracking-tight">Commits Per Day</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Weekly cadence derived from contribution timeline.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          Last 52 Weeks
        </p>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {weekdayTotals.map((total, index) => {
          const ratio = total / peakValue;
          const height = `${Math.max(8, Math.round(ratio * 100))}%`;

          return (
            <div key={WEEKDAY_LABELS[index]} className="space-y-2">
              <div className="flex h-36 items-end border border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] p-1">
                <div
                  className="w-full bg-[var(--color-accent)]"
                  style={{
                    height,
                    boxShadow: "0 0 12px var(--color-accent-glow)",
                  }}
                  title={`${WEEKDAY_LABELS[index]}: ${total} contributions`}
                />
              </div>
              <p className="text-center font-mono text-[10px] tracking-[0.12em] text-[var(--color-text-secondary)]">
                {WEEKDAY_LABELS[index]}
              </p>
              <p className="text-center font-mono text-[10px] text-[var(--color-signal)]">{total}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
