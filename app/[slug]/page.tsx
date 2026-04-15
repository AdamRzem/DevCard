import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { getPublicProfileBySlug } from "@/lib/public/profiles";

type PublicProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getProfileCached = cache((slug: string) => getPublicProfileBySlug(slug));

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function toSafeUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw);

    if (parsed.protocol === "https:" || parsed.protocol === "mailto:") {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
}

function toQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry);
      }
      continue;
    }

    if (typeof value === "string") {
      query.set(key, value);
    }
  }

  const queryText = query.toString();
  return queryText.length > 0 ? `?${queryText}` : "";
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const profile = await getProfileCached(normalizedSlug);

  if (!profile) {
    return {
      title: "Profile Not Found",
      description: "The requested public DevCard profile could not be found.",
    };
  }

  return {
    title: `${profile.displayName} (@${profile.username})`,
    description: `Read-only developer profile for ${profile.displayName}: projects, languages, and contribution highlights.`,
    alternates: {
      canonical: `/${normalizedSlug}`,
    },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const query = toQueryString(await searchParams);

  if (slug !== normalizedSlug) {
    permanentRedirect(`/${encodeURIComponent(normalizedSlug)}${query}`);
  }

  const profile = await getProfileCached(normalizedSlug);

  if (!profile) {
    notFound();
  }

  const recruiterLinks = [
    { label: "GitHub", href: toSafeUrl(profile.links.github), external: true },
    { label: "Resume", href: toSafeUrl(profile.links.resume), external: true },
    { label: "Contact", href: toSafeUrl(profile.links.contact), external: false },
  ].filter(
    (
      link,
    ): link is {
      label: string;
      href: string;
      external: boolean;
    } => Boolean(link.href),
  );

  const safeTopRepos = profile.topRepos.reduce<
    Array<
      (typeof profile.topRepos)[number] & {
        safeUrl: string;
      }
    >
  >((entries, repo) => {
    const safeUrl = toSafeUrl(repo.url);

    if (safeUrl) {
      entries.push({
        ...repo,
        safeUrl,
      });
    }

    return entries;
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge tone="success">Public Recruiter View</Badge>
            <Badge tone="neutral">Read-Only Profile</Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {profile.displayName}
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
            @{profile.username} · {profile.title} · {profile.location}
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-[var(--color-text-secondary)]">
            {profile.bio}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Contributions
              </p>
              <p className="mt-2 text-3xl font-semibold">{profile.totalContributions}</p>
            </article>

            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Total Stars
              </p>
              <p className="mt-2 text-3xl font-semibold">{profile.totalStars}</p>
            </article>

            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Public Repos
              </p>
              <p className="mt-2 text-3xl font-semibold">{profile.publicRepos}</p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="glass rounded-3xl p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-tight">Top Languages</h2>
            <div className="mt-5 space-y-4">
              {profile.topLanguages.map((language) => (
                <div key={language.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>{language.name}</span>
                    <span>{language.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${language.percentage}%`,
                        backgroundColor: language.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass rounded-3xl p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-tight">Project Highlights</h2>
            <div className="mt-5 space-y-3">
              {safeTopRepos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 transition-transform hover:-translate-y-px"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold tracking-tight">{repo.name}</h3>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      ★ {repo.stars}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {repo.description}
                  </p>

                  <p
                    className="mt-3 text-xs font-medium"
                    style={{ color: repo.languageColor }}
                  >
                    {repo.language}
                  </p>
                </a>
              ))}
            </div>
          </article>
        </section>

        <section className="glass flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Recruiter links
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--color-text-secondary)]">
              {recruiterLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--color-text-primary)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="hover:text-[var(--color-text-primary)]"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>

          <Button href="/" variant="secondary">
            Get Your Own DevCard
          </Button>
        </section>
      </main>
    </div>
  );
}
