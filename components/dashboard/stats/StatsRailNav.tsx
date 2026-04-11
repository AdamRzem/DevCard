"use client";

import { useEffect, useState } from "react";

export type StatsRailSection = {
  id: string;
  label: string;
};

interface StatsRailNavProps {
  sections: StatsRailSection[];
}

export function StatsRailNav({ sections }: StatsRailNavProps) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      const elements = sections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => Boolean(element));

      if (elements.length === 0) {
        return;
      }

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

          if (visibleEntries.length > 0) {
            setActiveSectionId(visibleEntries[0].target.id);
          }
        },
        {
          rootMargin: "-30% 0px -55% 0px",
          threshold: [0.2, 0.45, 0.7],
        },
      );

      for (const element of elements) {
        observer.observe(element);
      }
    };

    setupObserver();

    const mutationObserver = new MutationObserver(() => {
      setupObserver();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
    };
  }, [sections]);

  return (
    <nav aria-label="Stats sections" className="space-y-1">
      {sections.map((section) => {
        const isActive = section.id === activeSectionId;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={isActive ? "location" : undefined}
            className={`group flex items-center gap-3 border-l px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-100 ${
              isActive
                ? "border-[var(--color-signal)] bg-[rgba(0,255,65,0.08)] text-[var(--color-signal)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 ${
                isActive ? "bg-[var(--color-signal)]" : "bg-[var(--color-border)]"
              }`}
            />
            <span>{section.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
