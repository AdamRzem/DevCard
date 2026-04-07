import Link from "next/link";

import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[var(--color-border)] bg-[hsla(230_20%_10%_/_0.65)] px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-md sm:px-4">
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
          <Button
            href="/api/auth/signin"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Sign In
          </Button>
          <Button href="/api/auth/signin" size="sm">
            Connect GitHub
          </Button>
        </div>
      </div>
    </header>
  );
}