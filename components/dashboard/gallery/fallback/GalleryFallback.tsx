"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  galleryProjects,
  type GalleryProject,
  type GalleryRoom,
} from "@/components/dashboard/gallery/data/galleryProjects";

const roomOrder: GalleryRoom[] = ["main-hall", "ai-wing", "experimental-lab", "archive"];

const roomLabels: Record<GalleryRoom, { id: string; label: string }> = {
  "main-hall": { id: "gallery-main-hall", label: "MAIN_HALL" },
  "ai-wing": { id: "gallery-ai-wing", label: "AI_WING" },
  "experimental-lab": { id: "gallery-lab", label: "EXPERIMENTAL_LAB" },
  archive: { id: "gallery-archive", label: "ARCHIVE" },
};

function GalleryFallbackCard({
  project,
  index,
  reduceMotion,
}: {
  project: GalleryProject;
  index: number;
  reduceMotion: boolean;
}) {
  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay: index * 0.06 },
      };

  return (
    <motion.article
      {...motionProps}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.3 }}
      className="hud-panel relative overflow-hidden px-5 py-6"
    >
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
    </motion.article>
  );
}

export function GalleryFallback() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-10">
      {roomOrder.map((room) => {
        const roomProjects = galleryProjects.filter((project) => project.room === room);

        if (roomProjects.length === 0) {
          return null;
        }

        return (
          <section
            key={room}
            id={roomLabels[room].id}
            className="space-y-4 scroll-mt-28"
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-[var(--color-signal)]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
                {roomLabels[room].label}
              </p>
            </div>

            <div className="space-y-4">
              {roomProjects.map((project, index) => (
                <GalleryFallbackCard
                  key={project.id}
                  project={project}
                  index={index}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
