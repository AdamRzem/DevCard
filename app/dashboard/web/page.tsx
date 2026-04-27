import { ProjectList } from "@/components/dashboard/projects/ProjectList";
import { ThreeDScene } from "@/components/dashboard/projects/ThreeDScene";
import { webProjects } from "@/lib/dashboard/projects";

export default function DashboardWebPage() {
  return (
    <section className="space-y-6">
      <header className="hud-panel p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-[var(--color-signal)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            DATABASE_STATUS: ACTIVE
          </p>
        </div>

        <h1 className="mt-4 font-headline text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
          CORE_INDEX
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
          Curated web project archive. Each entry routes directly to the corresponding GitHub
          repository for recruiter verification.
        </p>
      </header>

      <ThreeDScene projects={webProjects} sceneLabel="WEB_GALLERY" />

      <ProjectList projects={webProjects} sectionPrefix="web" />
    </section>
  );
}
