import { auth } from "@/auth";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";

export default async function DashboardStatsPage() {
  const session = await auth();
  const githubLogin = session?.user.githubLogin ?? null;

  return (
    <section className="space-y-6">
      <header className="hud-panel p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-[var(--color-signal)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            SYSTEM_CORE_STATUS: OPERATIONAL
          </p>
        </div>

        <h1 className="mt-4 font-headline text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
          DIAGNOSTICS_ENGINE
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
          Language mix, activity cadence, contribution heat signatures, and repository impact
          from your live GitHub profile.
        </p>
      </header>

      <DashboardAnalytics githubLogin={githubLogin} />
    </section>
  );
}
