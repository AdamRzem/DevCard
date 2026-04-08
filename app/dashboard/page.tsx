import Image from "next/image";

import { auth } from "@/auth";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEMO_PUBLIC_SLUG } from "@/lib/public/profiles";

export default async function DashboardPage() {
  const session = await auth();
  const displayName = session?.user.githubLogin ?? session?.user.name ?? "Developer";
  const avatarUrl = session?.user.image;
  const githubLogin = session?.user.githubLogin ?? null;

  return (
    <>
      <section className="glass rounded-3xl p-7 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Badge tone="accent">Creator Workspace</Badge>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Hello, {displayName}
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
              This dashboard pulls your latest GitHub profile insights and shows
              contribution activity, language mix, and impact-sorted repositories.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/dashboard/editor" disabled>
                Create Your Card →
              </Button>
              <Button href={`/${DEMO_PUBLIC_SLUG}`} variant="secondary">
                View Public Profile Route
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:min-w-[220px]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} avatar`}
                width={60}
                height={60}
                className="h-14 w-14 rounded-full border border-[var(--color-border)] object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-lg font-semibold uppercase">
                {displayName.slice(0, 1)}
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Active Session
              </p>
              <p className="mt-1 font-medium text-[var(--color-text-primary)]">
                {displayName}
              </p>
            </div>
          </div>
        </div>
      </section>

      <DashboardAnalytics githubLogin={githubLogin} />
    </>
  );
}
