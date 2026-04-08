import Image from "next/image";
import Link from "next/link";

import { auth, hasRequiredAuthEnv, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DEMO_PUBLIC_SLUG } from "@/lib/public/profiles";

const navLinks = [
  { href: `/${DEMO_PUBLIC_SLUG}`, label: "Recruiter View" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
];

async function signInWithGitHub() {
  "use server";

  if (!hasRequiredAuthEnv()) {
    throw new Error(
      "Missing required auth environment variables. Update .env.local before signing in.",
    );
  }

  await signIn("github", { redirectTo: "/dashboard" });
}

async function signOutUser() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function Navbar() {
  const session = await auth();
  const authReady = hasRequiredAuthEnv();
  const isSignedIn = Boolean(session?.user);
  const displayName = session?.user?.githubLogin ?? session?.user?.name ?? "Developer";
  const avatarUrl = session?.user?.avatarUrl ?? session?.user?.image;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[var(--color-border)] bg-[var(--color-bg-glass)] px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-md sm:px-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-bold tracking-[0.08em] text-[var(--color-accent)]">
            DC
          </span>
          <span className="text-sm font-semibold tracking-wide text-[var(--color-text-primary)] sm:text-base">
            DevCard
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--color-text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isSignedIn ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 sm:flex">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={22}
                    height={22}
                    unoptimized
                    className="h-[22px] w-[22px] rounded-full"
                  />
                ) : (
                  <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[11px] font-semibold text-[var(--color-accent)]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {displayName}
                </span>
              </div>

              <form action={signOutUser}>
                <Button type="submit" variant="secondary" size="sm">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              {authReady ? (
                <>
                  <form action={signInWithGitHub} className="hidden sm:block">
                    <Button type="submit" variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </form>

                  <form action={signInWithGitHub}>
                    <Button type="submit" size="sm">
                      Connect GitHub
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex"
                    disabled
                    title="Set AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, and AUTH_SECRET in .env.local"
                  >
                    Sign In
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    disabled
                    title="Set AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, and AUTH_SECRET in .env.local"
                  >
                    Configure Auth Keys
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}