import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Navbar } from "@/components/ui/Navbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:border focus:border-[var(--color-border)] focus:bg-[var(--color-bg-secondary)] focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to dashboard content
      </a>

      <Navbar />

      <main
        id="dashboard-content"
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-28 sm:px-10 lg:px-12"
      >
        {children}
      </main>
    </div>
  );
}
