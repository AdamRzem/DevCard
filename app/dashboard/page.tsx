import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { DEMO_PUBLIC_SLUG } from "@/lib/public/profiles";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <section className="glass rounded-3xl p-7 sm:p-8">
          <Badge tone="accent">Creator Workspace</Badge>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome, {session.user.githubLogin ?? session.user.name ?? "Developer"}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
            You are signed in and inside the protected creator area. Dashboard
            analytics and GitHub sync panels are implemented in the next phases.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard/editor" disabled>
              Open Card Editor (Phase 6)
            </Button>
            <Button href={`/${DEMO_PUBLIC_SLUG}`} variant="secondary">
              View Public Profile Route
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
