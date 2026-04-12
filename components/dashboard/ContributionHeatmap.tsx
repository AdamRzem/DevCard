"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ContributionDay = {
  contributionCount: number;
  date: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

interface ContributionHeatmapProps {
  weeks: ContributionWeek[];
  totalContributions: number;
}

const ROW_COUNT = 7;

function formatContributionLabel(day: ContributionDay) {
  const date = new Date(day.date);
  const readableDate = Number.isNaN(date.getTime())
    ? day.date
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);

  const contributionWord = day.contributionCount === 1 ? "contribution" : "contributions";
  return `${day.contributionCount} ${contributionWord} on ${readableDate}`;
}

function getHeatColor(contributionCount: number, maxCount: number) {
  if (contributionCount <= 0 || maxCount <= 0) {
    return "var(--color-bg-tertiary)";
  }

  const intensity = Math.min(1, contributionCount / maxCount);
  const alpha = 0.24 + intensity * 0.7;
  return `hsla(135, 100%, 50%, ${alpha.toFixed(3)})`;
}

function getNextIndexByKey(key: string, currentIndex: number, cellCount: number) {
  const row = currentIndex % ROW_COUNT;

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return cellCount - 1;
  }

  if (key === "ArrowLeft") {
    const candidate = currentIndex - ROW_COUNT;
    return candidate >= 0 ? candidate : currentIndex;
  }

  if (key === "ArrowRight") {
    const candidate = currentIndex + ROW_COUNT;
    return candidate < cellCount ? candidate : currentIndex;
  }

  if (key === "ArrowUp") {
    return row > 0 ? currentIndex - 1 : currentIndex;
  }

  if (key === "ArrowDown") {
    const candidate = currentIndex + 1;
    if (row >= ROW_COUNT - 1 || candidate >= cellCount) {
      return currentIndex;
    }

    const sameWeek = Math.floor(candidate / ROW_COUNT) === Math.floor(currentIndex / ROW_COUNT);
    return sameWeek ? candidate : currentIndex;
  }

  return currentIndex;
}

export function ContributionHeatmap({ weeks, totalContributions }: ContributionHeatmapProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const flattenedDays = useMemo(
    () =>
      weeks.flatMap((week, weekIndex) =>
        week.contributionDays.map((day, dayIndex) => ({
          day,
          weekIndex,
          dayIndex,
          linearIndex: weekIndex * ROW_COUNT + dayIndex,
        })),
      ),
    [weeks],
  );
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, flattenedDays.length - 1));

  const activeDayLabel =
    flattenedDays.length > 0
      ? formatContributionLabel(flattenedDays[safeActiveIndex].day)
      : "No contribution data available yet.";

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setReducedMotion(media.matches);

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => {
      media.removeEventListener("change", applyPreference);
    };
  }, []);

  const maxContributionCount = useMemo(
    () =>
      weeks.reduce((max, week) => {
        const weekMax = week.contributionDays.reduce(
          (weekValueMax, day) => Math.max(weekValueMax, day.contributionCount),
          0,
        );

        return Math.max(max, weekMax);
      }, 0),
    [weeks],
  );

  const handleKeyboardNavigation = (key: string, currentIndex: number) => {
    const nextIndex = getNextIndexByKey(key, currentIndex, flattenedDays.length);

    if (nextIndex === currentIndex) {
      return;
    }

    setActiveIndex(nextIndex);
    cellRefs.current[nextIndex]?.focus();
  };

  return (
    <article className="hud-panel p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-2xl font-semibold tracking-tight">Contribution Activity</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {totalContributions.toLocaleString("en-US")} total contributions this year
          </p>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">GitHub-style heat intensity</p>
      </div>

      <p
        aria-live="polite"
        className="mt-4 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-secondary)]"
      >
        {activeDayLabel}
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Tab into the grid and use arrow keys to move across days.
      </p>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="inline-flex gap-1.5" role="group" aria-label="Contribution heatmap">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
              {week.contributionDays.map((day, dayIndex) => {
                const label = formatContributionLabel(day);
                const delayMs = Math.min((weekIndex * 7 + dayIndex) * 35, 560);
                const linearIndex = weekIndex * ROW_COUNT + dayIndex;

                return (
                  <button
                    key={day.date}
                    type="button"
                    title={label}
                    aria-label={label}
                    tabIndex={linearIndex === safeActiveIndex ? 0 : -1}
                    onFocus={() => setActiveIndex(linearIndex)}
                    onKeyDown={(event) => {
                      if (
                        event.key !== "ArrowLeft" &&
                        event.key !== "ArrowRight" &&
                        event.key !== "ArrowUp" &&
                        event.key !== "ArrowDown" &&
                        event.key !== "Home" &&
                        event.key !== "End"
                      ) {
                        return;
                      }

                      event.preventDefault();
                      handleKeyboardNavigation(event.key, linearIndex);
                    }}
                    ref={(element) => {
                      cellRefs.current[linearIndex] = element;
                    }}
                    className="animate-fade-in h-3.5 w-3.5 border border-[var(--color-border-subtle)] transition-[transform,filter] duration-150 ease-[var(--ease-smooth)] hover:-translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-secondary)]"
                    style={{
                      backgroundColor: getHeatColor(day.contributionCount, maxContributionCount),
                      animationDelay: reducedMotion ? undefined : `${delayMs}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
