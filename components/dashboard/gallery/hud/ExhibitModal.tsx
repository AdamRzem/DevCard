"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

import type { GalleryProject } from "@/components/dashboard/gallery/data/galleryProjects";

interface ExhibitModalProps {
  project: GalleryProject | null;
  onClose: () => void;
}

export function ExhibitModal({ project, onClose }: ExhibitModalProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!project) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, project]);

  const backdropMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      };

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(4,4,4,0.7)] px-4 py-6"
          {...backdropMotion}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="hud-panel glass w-full max-w-5xl overflow-hidden"
            {...panelMotion}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exhibit-modal-title"
          >
            <div className="border-b border-[var(--color-border)] px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: project.accentColor }}
                  >
                    {project.exhibitNumber}
                  </p>
                  <h2
                    id="exhibit-modal-title"
                    className="mt-2 font-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]"
                  >
                    {project.title}
                  </h2>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    {project.codeName} // {project.year}
                  </p>
                </div>
                {project.award ? (
                  <span className="border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                    {project.award}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-5">
                <div className="hud-panel glass relative h-52 overflow-hidden">
                  {project.mediaUrl ? (
                    <Image
                      src={project.mediaUrl}
                      alt={`${project.title} media preview`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 480px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                        MEDIA: {project.mediaType.toUpperCase()}
                      </p>
                    </div>
                  )}
                  <div
                    className="absolute inset-x-0 bottom-0 h-10"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${project.accentColor}22)`,
                    }}
                  />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    SUMMARY
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                    {project.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    HIGHLIGHTS
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
                    {project.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span
                          className="mt-[7px] h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: project.accentColor }}
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    TECH_STACK
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-6 py-4">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-100 hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
              >
                VIEW_GITHUB
              </a>
              <button
                type="button"
                onClick={onClose}
                className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-100 hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ExhibitModal;
