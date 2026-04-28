"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { GalleryFallback } from "@/components/dashboard/gallery/fallback/GalleryFallback";
import { GalleryScene } from "@/components/dashboard/gallery/scene/GalleryScene";
import {
  galleryProjects,
  type GalleryProject,
} from "@/components/dashboard/gallery/data/galleryProjects";

function canRenderWebGL2() {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2"));
}

function isLowCoreDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  return cores <= 2;
}

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function GalleryRoomPanel({
  id,
  label,
  projects,
}: {
  id: string;
  label: string;
  projects: GalleryProject[];
}) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section id={id} className="space-y-4 scroll-mt-28">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 bg-[var(--color-signal)]" />
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
          {label}
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <article key={project.id} className="hud-panel relative overflow-hidden px-5 py-6">
            <div
              className="absolute inset-y-0 left-0 w-1"
              style={{ backgroundColor: project.accentColor }}
            />

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-signal)]">
                  {project.exhibitNumber}
                </p>
                <h3 className="mt-2 font-headline text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {project.title}
                </h3>
              </div>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] transition-colors duration-100 hover:text-[var(--color-text-primary)]"
              >
                VIEW_GITHUB
              </a>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              {project.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={`${project.id}-${tag}`}
                  className="border border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GalleryExperience() {
  const hasHydrated = useHasHydrated();
  const [activeExhibitId, setActiveExhibitId] = useState<string | null>(null);
  const useFallback = useMemo(() => {
    if (!hasHydrated) {
      return null;
    }

    return !canRenderWebGL2() || isLowCoreDevice();
  }, [hasHydrated]);

  const aiWingProjects = galleryProjects.filter((project) => project.room === "ai-wing");
  const labProjects = galleryProjects.filter(
    (project) => project.room === "experimental-lab",
  );

  return (
    <section
      className="space-y-6"
      data-active-exhibit-id={activeExhibitId ?? ""}
    >
      <header className="hud-panel p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-[var(--color-signal)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            GALLERY_STATUS: ONLINE
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
              EXHIBIT_GALLERY
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Cross-domain projects staged as museum exhibits, spanning AI systems, rapid
              experiments, and tooling narratives.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            EXHIBITS: {galleryProjects.length}
          </p>
        </div>
      </header>

      {useFallback === null ? (
        <section className="hud-panel p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            GALLERY_INIT: PROBING_WEBGL
          </p>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Preparing gallery environment.
          </p>
        </section>
      ) : useFallback ? (
        <GalleryFallback />
      ) : (
        <>
          <section id="gallery-main-hall" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-[var(--color-signal)]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
                MAIN_HALL
              </p>
            </div>

            <GalleryScene onSelectExhibit={setActiveExhibitId} />
          </section>

          <GalleryRoomPanel id="gallery-ai-wing" label="AI_WING" projects={aiWingProjects} />
          <GalleryRoomPanel
            id="gallery-lab"
            label="EXPERIMENTAL_LAB"
            projects={labProjects}
          />
        </>
      )}
    </section>
  );
}
