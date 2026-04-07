import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { StatCard } from "@/components/ui/StatCard";

const featureSteps = [
  {
    title: "Visualize",
    description:
      "Sync your GitHub activity and transform raw commits, stars, and repos into a readable profile snapshot.",
  },
  {
    title: "Customize",
    description:
      "Pick themes, reorder sections, and tune colors so your developer card feels like your personal brand.",
  },
  {
    title: "Share",
    description:
      "Publish a clean public URL and image-ready card recruiters can parse in under 30 seconds.",
  },
];

const quickStats = [
  { label: "Cards Generated", value: 1284, suffix: "+", icon: "⚡" },
  { label: "Developers Onboarded", value: 412, suffix: "+", icon: "👩‍💻" },
  { label: "Recruiter Views", value: 9673, suffix: "+", icon: "📈" },
];

const languagePreview = [
  { name: "TypeScript", share: "44%" },
  { name: "React", share: "28%" },
  { name: "Python", share: "18%" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-20 pt-28 sm:px-10 lg:px-12">
        <section className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-7">
            <Badge tone="cyan" className="animate-fade-in-up">
              GitHub Portfolio Visualizer
            </Badge>

            <div className="space-y-5">
              <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
                Turn your GitHub footprint into a
                <span className="gradient-text block"> recruiter-ready card</span>
              </h1>

              <p className="animate-fade-in-up delay-100 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg sm:leading-8">
                DevCard converts contribution history, language trends, and top
                repositories into a polished public profile you can share in one
                link.
              </p>
            </div>

            <div className="animate-fade-in-up delay-200 flex flex-wrap items-center gap-3">
              <Button href="/api/auth/signin" size="lg">
                Connect GitHub
              </Button>
              <Button href="#features" variant="secondary" size="lg">
                Explore Features
              </Button>
            </div>

            <div className="animate-fade-in-up delay-300 flex flex-wrap gap-2">
              <Badge tone="neutral">TypeScript</Badge>
              <Badge tone="neutral">Next.js 16</Badge>
              <Badge tone="neutral">Tailwind CSS 4</Badge>
              <Badge tone="neutral">AWS Ready</Badge>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[470px]">
            <div className="glass animate-float rounded-3xl p-6 shadow-[var(--shadow-card-hover)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    DevCard Preview
                  </p>
                  <p className="mt-1 text-xl font-semibold">@AdamRzem</p>
                </div>
                <Badge tone="accent">Live Sync</Badge>
              </div>

              <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                {languagePreview.map((language) => (
                  <div key={language.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                      <span>{language.name}</span>
                      <span>{language.share}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)]"
                        style={{ width: language.share }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Longest streak
                </p>
                <p className="text-lg font-semibold text-[var(--color-success)]">
                  152 days
                </p>
              </div>
            </div>

            <div className="animate-pulse-glow absolute -right-5 -top-5 hidden h-20 w-20 rounded-full bg-[hsla(200_90%_60%_/_0.2)] blur-2xl sm:block" />
            <div className="animate-pulse-glow delay-300 absolute -bottom-7 -left-6 hidden h-24 w-24 rounded-full bg-[hsla(265_90%_65%_/_0.22)] blur-2xl sm:block" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              icon={stat.icon}
            />
          ))}
        </section>

        <section id="features" className="scroll-mt-28 space-y-7">
          <div className="max-w-2xl space-y-3">
            <Badge tone="warning">Three-step flow</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for recruiter speed, crafted for developer pride
            </h2>
            <p className="text-[var(--color-text-secondary)] sm:text-lg">
              Every interaction is focused on one outcome: communicate technical
              impact instantly without sacrificing personality.
            </p>
          </div>

          <div id="how-it-works" className="scroll-mt-28 grid gap-4 md:grid-cols-3">
            {featureSteps.map((item, index) => (
              <article
                key={item.title}
                className="glass animate-fade-in-up rounded-2xl p-6 shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${index * 130}ms` }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  Step {index + 1}
                </p>
                <h3 className="mb-2 text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            DevCard helps developers tell a stronger story with real GitHub
            evidence.
          </p>

          <div className="flex items-center gap-5 text-[var(--color-text-secondary)]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-[var(--color-text-primary)]"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-[var(--color-text-primary)]"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
