"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardLeftRail } from "@/components/dashboard/hud/DashboardLeftRail";
import { ProfileTerminalPanel } from "@/components/dashboard/terminal/ProfileTerminalPanel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface DashboardHudShellProps {
  children: React.ReactNode;
  displayName: string;
  signOutAction: () => Promise<void>;
}

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function DashboardHudShell({
  children,
  displayName,
  signOutAction,
}: DashboardHudShellProps) {
  const pathname = usePathname();
  const mode: "web" | "mobile" | "stats" | "editor" = pathname.endsWith("/web")
    ? "web"
    : pathname.endsWith("/mobile")
      ? "mobile"
      : pathname.endsWith("/editor")
        ? "editor"
        : "stats";
  const isMobileScene = Boolean(mode === "mobile");

  return (
    <div className="hud-shell min-h-screen overflow-x-hidden">
      {isMobileScene ? null : (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard/stats"
              className="font-headline text-xl font-semibold tracking-tight text-[var(--color-text-primary)]"
            >
              ARCHITECT&apos;S_ARCHIVE
            </Link>

            <nav className="hidden items-center gap-6 md:flex" aria-label="Dashboard modes">
              <Link
                href="/dashboard/stats"
                aria-current={mode === "stats" ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-100",
                  mode === "stats"
                    ? "border-[var(--color-signal)] text-[var(--color-signal)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                STATS
              </Link>
              <Link
                href="/dashboard/web"
                aria-current={mode === "web" ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-100",
                  mode === "web"
                    ? "border-[var(--color-signal)] text-[var(--color-signal)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                WEB
              </Link>
              <Link
                href="/dashboard/mobile"
                aria-current={mode === "mobile" ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-100",
                  mode === "mobile"
                    ? "border-[var(--color-signal)] text-[var(--color-signal)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                MOBILE
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)] sm:block">
              {displayName}
            </p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)] transition-colors duration-100 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Sign Out
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>
      )}

      <div
        className={cn(
          "mx-auto min-h-screen max-w-[2200px]",
          isMobileScene
            ? "grid grid-cols-1 pt-0"
            : "grid grid-cols-1 pt-16 lg:grid-cols-[256px_1fr] xl:grid-cols-[256px_1fr_420px]",
        )}
      >
        {isMobileScene ? null : <DashboardLeftRail />}

        <main
          id="dashboard-content"
          tabIndex={-1}
          className={cn(
            "px-4 sm:px-6",
            isMobileScene ? "pb-0 pt-4 lg:pt-5" : "pb-24 pt-6 lg:pt-8",
          )}
        >
          {children}
        </main>

        {isMobileScene ? null : (
          <div className="hidden xl:block">
            <ProfileTerminalPanel
              key={mode}
              modeLabel={mode === "editor" ? "stats" : mode}
            />
          </div>
        )}
      </div>

      {isMobileScene ? null : (
      <nav className="fixed inset-x-0 bottom-0 z-50 grid h-20 grid-cols-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] lg:hidden">
        <Link
          href="/dashboard/stats"
          aria-current={mode === "stats" ? "page" : undefined}
          className={cn(
            "flex flex-col items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-100",
            mode === "stats" ? "text-[var(--color-signal)]" : "text-[var(--color-text-muted)]",
          )}
        >
          STATS
        </Link>
        <Link
          href="/dashboard/web"
          aria-current={mode === "web" ? "page" : undefined}
          className={cn(
            "flex flex-col items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-100",
            mode === "web" ? "text-[var(--color-signal)]" : "text-[var(--color-text-muted)]",
          )}
        >
          WEB
        </Link>
        <Link
          href="/dashboard/mobile"
          aria-current={mode === "mobile" ? "page" : undefined}
          className={cn(
            "flex flex-col items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-100",
            mode === "mobile" ? "text-[var(--color-signal)]" : "text-[var(--color-text-muted)]",
          )}
        >
          MOBILE
        </Link>
        <Link
          href="/dashboard/editor"
          aria-current={mode === "editor" ? "page" : undefined}
          className={cn(
            "flex flex-col items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-100",
            mode === "editor" ? "text-[var(--color-signal)]" : "text-[var(--color-text-muted)]",
          )}
        >
          EDITOR
        </Link>
      </nav>
      )}
    </div>
  );
}
