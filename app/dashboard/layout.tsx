import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { DashboardHudShell } from "@/components/dashboard/hud/DashboardHudShell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  async function signOutFromDashboard() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const displayName = session.user.githubLogin ?? session.user.name ?? "NODE_01";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:border focus:border-[var(--color-border)] focus:bg-[var(--color-bg-secondary)] focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to dashboard content
      </a>

      <DashboardHudShell displayName={displayName} signOutAction={signOutFromDashboard}>
        {children}
      </DashboardHudShell>
    </div>
  );
}
