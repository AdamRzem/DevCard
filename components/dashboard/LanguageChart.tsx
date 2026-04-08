"use client";

import { useEffect, useId, useMemo, useState } from "react";

type LanguageSlice = {
  name: string;
  percentage: number;
  color: string;
};

interface LanguageChartProps {
  languages: LanguageSlice[];
}

function toConicGradient(languages: LanguageSlice[]) {
  if (languages.length === 0) {
    return "conic-gradient(from -90deg, var(--color-bg-tertiary) 0% 100%)";
  }

  const normalizedLanguages = languages.map((language) => ({
    ...language,
    percentage: Math.max(language.percentage, 0),
  }));

  const total = normalizedLanguages.reduce((sum, language) => sum + language.percentage, 0);

  if (total <= 0) {
    return "conic-gradient(from -90deg, var(--color-bg-tertiary) 0% 100%)";
  }

  let cursor = 0;

  const parts = normalizedLanguages.map((language) => {
    const start = (cursor / total) * 100;
    cursor += language.percentage;
    const end = (cursor / total) * 100;

    return `${language.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(from -90deg, ${parts.join(", ")})`;
}

export function LanguageChart({ languages }: LanguageChartProps) {
  const [mounted, setMounted] = useState(false);
  const coverageId = useId();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const chartGradient = useMemo(() => toConicGradient(languages), [languages]);
  const totalShare = useMemo(
    () => languages.reduce((sum, language) => sum + Math.max(language.percentage, 0), 0),
    [languages],
  );

  return (
    <article className="glass rounded-3xl p-6 sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight">Language Breakdown</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Top languages from enriched repositories.
      </p>

      <figure className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          role="img"
          aria-label="Language distribution donut chart"
          aria-describedby={coverageId}
          className={`relative mx-auto h-44 w-44 rounded-full border border-[var(--color-border)] transition-[opacity,transform] duration-300 ease-[var(--ease-spring)] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: chartGradient,
            transform: mounted ? "scale(1)" : "scale(0.92)",
          }}
        >
          <div className="absolute inset-7 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)]" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p
                id={coverageId}
                className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
              >
                Coverage
              </p>
              <p className="mt-1 text-lg font-semibold">
                {Math.round(totalShare)}%
              </p>
            </div>
          </div>
        </div>

        <figcaption className="w-full space-y-2">
          {languages.length > 0 ? (
            languages.map((language) => (
              <div
                key={language.name}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: language.color }}
                  />
                  <span>{language.name}</span>
                </span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {language.percentage.toFixed(1)}%
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
              No language data available yet.
            </p>
          )}
        </figcaption>
      </figure>
    </article>
  );
}
