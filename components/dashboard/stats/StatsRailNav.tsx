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
    setActiveSectionId((currentActiveSectionId) => {
      if (sections.length === 0) {
        return "";
      }

      if (sections.some((section) => section.id === currentActiveSectionId)) {
        return currentActiveSectionId;
      }

      return sections[0].id;
    });
  }, [sections]);

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    let observer: IntersectionObserver | null = null;

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    const ratioMap = new Map<string, number>(
      elements.map((element) => [element.id, 0]),
    );

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratioMap.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let maxRatio = 0;
        let maxId = "";
        for (const [id, ratio] of ratioMap) {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        }

        if (maxRatio > 0) {
          setActiveSectionId(maxId);
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

    return () => {
      observer?.disconnect();
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
