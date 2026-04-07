"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function StatCard({
  label,
  value,
  icon,
  prefix,
  suffix,
  durationMs = 900,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const latestValueRef = useRef(0);

  useEffect(() => {
    const startValue = latestValueRef.current;
    const difference = value - startValue;
    const shouldReduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frameId = 0;

    if (shouldReduceMotion || durationMs <= 0) {
      frameId = window.requestAnimationFrame(() => {
        setDisplayValue(value);
        latestValueRef.current = value;
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + difference * eased;
      latestValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        latestValueRef.current = value;
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [durationMs, value]);

  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  const formattedValue = useMemo(
    () => formatter.format(Math.round(displayValue)),
    [displayValue, formatter],
  );

  return (
    <article
      className={cn(
        "glass animate-fade-in-up rounded-2xl p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </p>
        {icon ? (
          <span className="text-lg text-[var(--color-accent)]">{icon}</span>
        ) : null}
      </div>

      <p className="animate-count-up mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        {prefix}
        {formattedValue}
        {suffix}
      </p>
    </article>
  );
}