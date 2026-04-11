import type { DashboardProject, ProjectGroup } from "@/lib/dashboard/projects";
import { ProjectStrip } from "@/components/dashboard/projects/ProjectStrip";

interface ProjectListProps {
  projects: DashboardProject[];
  sectionPrefix: string;
}

const groupOrder: ProjectGroup[] = ["featured", "open-source", "experiments"];

const groupMetadata: Record<ProjectGroup, { id: string; label: string }> = {
  featured: {
    id: "featured",
    label: "FEATURED",
  },
  "open-source": {
    id: "open-source",
    label: "OPEN_SOURCE",
  },
  experiments: {
    id: "experiments",
    label: "EXPERIMENTS",
  },
};

export function ProjectList({ projects, sectionPrefix }: ProjectListProps) {
  return (
    <div className="space-y-10">
      {groupOrder.map((group) => {
        const groupedProjects = projects.filter((project) => project.group === group);

        if (groupedProjects.length === 0) {
          return null;
        }

        return (
          <section
            key={group}
            id={`${sectionPrefix}-${groupMetadata[group].id}`}
            className="space-y-4 scroll-mt-28"
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-[var(--color-signal)]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
                {groupMetadata[group].label}
              </p>
            </div>

            <div className="space-y-3">
              {groupedProjects.map((project) => (
                <ProjectStrip key={project.id} project={project} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
