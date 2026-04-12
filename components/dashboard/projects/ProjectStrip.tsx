import type { DashboardProject } from "@/lib/dashboard/projects";

interface ProjectStripProps {
  project: DashboardProject;
}

export function ProjectStrip({ project }: ProjectStripProps) {
  return (
    <a
      href={project.githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-6 transition-colors duration-100 hover:border-[var(--color-accent)]"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-transparent transition-colors duration-100 group-hover:bg-[var(--color-accent)]" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-signal)]">
            {project.codeName}
          </p>
          <h3 className="mt-2 font-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] transition-colors duration-100 group-hover:text-[var(--color-accent)]">
            {project.title}
          </h3>
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          ACCESS_GITHUB
        </span>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
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
    </a>
  );
}
