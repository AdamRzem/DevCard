"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";

type GenerateCardResponse = {
  data: {
    id: string;
    slug: string;
    theme: string;
    layout: string;
    sections: string[];
    customColors: Record<string, string>;
    isPublic: boolean;
    imageUrl: string | null;
    viewCount: number;
    updatedAt: string;
  };
};

type PublicCardResponse = {
  data: {
    slug: string;
    theme: string;
    layout: string;
    sections: string[];
    customColors: Record<string, string>;
    imageUrl: string | null;
    viewCount: number;
    updatedAt: string;
    owner: {
      username: string;
      displayName: string;
      avatarUrl: string | null;
      githubUrl: string;
    };
  };
};

const DEFAULT_SECTIONS = ["bio", "stats", "languages", "repos"];
const AVAILABLE_SECTIONS = [
  "bio",
  "stats",
  "languages",
  "repos",
  "contributions",
  "achievements",
] as const;

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

interface CardEditorWorkbenchProps {
  defaultSlug: string;
}

export function CardEditorWorkbench({ defaultSlug }: CardEditorWorkbenchProps) {
  const [slug, setSlug] = useState(defaultSlug);
  const [theme, setTheme] = useState("dark-minimal");
  const [layout, setLayout] = useState("full");
  const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [accentColor, setAccentColor] = useState("#ff4500");
  const [textColor, setTextColor] = useState("#e5e2e1");
  const [backgroundColor, setBackgroundColor] = useState("#080a0c");
  const [isPublic, setIsPublic] = useState(true);

  const [saving, setSaving] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedCard, setSavedCard] = useState<GenerateCardResponse["data"] | null>(null);
  const [publishedCard, setPublishedCard] = useState<PublicCardResponse["data"] | null>(null);

  const previewUrl = useMemo(() => {
    const normalizedSlug = slug.trim().toLowerCase();
    if (!normalizedSlug) {
      return null;
    }

    return `/card/${encodeURIComponent(normalizedSlug)}`;
  }, [slug]);

  function toggleSection(section: string) {
    setSections((current) => {
      if (current.includes(section)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((item) => item !== section);
      }

      return [...current, section];
    });
  }

  async function saveCard() {
    const normalizedSlug = slug.trim().toLowerCase();

    if (!normalizedSlug) {
      setErrorMessage("Slug is required.");
      setSaveMessage(null);
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/card/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: normalizedSlug,
          theme,
          layout,
          sections,
          customColors: {
            accent: accentColor,
            text: textColor,
            background: backgroundColor,
          },
          isPublic,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as
        | GenerateCardResponse
        | { error?: string };

      if (!response.ok || !("data" in payload)) {
        const error = "error" in payload && payload.error ? payload.error : "Failed to save card.";
        throw new Error(error);
      }

      setSavedCard(payload.data);
      setSaveMessage("Card settings saved. Loading public card payload...");
      await loadPublishedCard(normalizedSlug);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function loadPublishedCard(slugOverride?: string) {
    const normalizedSlug = (slugOverride ?? slug).trim().toLowerCase();

    if (!normalizedSlug) {
      setErrorMessage("Enter a slug to load public card data.");
      return;
    }

    setLoadingPublished(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/card/${encodeURIComponent(normalizedSlug)}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => ({}))) as
        | PublicCardResponse
        | { error?: string };

      if (!response.ok || !("data" in payload)) {
        if (response.status === 404) {
          throw new Error(
            "Public card not found. Ensure both your card and profile visibility are public, then retry.",
          );
        }

        const error = "error" in payload && payload.error ? payload.error : "Failed to load public card data.";
        throw new Error(error);
      }

      setPublishedCard(payload.data);
      setSaveMessage("Card saved and verified via public API.");
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      setPublishedCard(null);
    } finally {
      setLoadingPublished(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="hud-panel p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-[var(--color-signal)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            CARD_EDITOR_STATUS: LIVE
          </p>
        </div>

        <h1 className="mt-4 font-headline text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
          CARD_EDITOR
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
          This editor writes card settings through /api/card/generate and validates output through
          /api/card/[slug].
        </p>
      </header>

      <section id="card-editor-form" className="hud-panel space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Slug
            </span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-signal)]"
              placeholder="your-slug"
            />
          </label>

          <label className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Theme
            </span>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-signal)]"
            >
              <option value="dark-minimal">dark-minimal</option>
              <option value="dark-grid">dark-grid</option>
              <option value="light-clean">light-clean</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Layout
            </span>
            <select
              value={layout}
              onChange={(event) => setLayout(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-signal)]"
            >
              <option value="full">full</option>
              <option value="compact">compact</option>
              <option value="minimal">minimal</option>
            </select>
          </label>

          <label className="flex items-end gap-3 pb-1">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-signal)]"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Public card
            </span>
          </label>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
            Sections
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_SECTIONS.map((section) => (
              <label
                key={section}
                className="flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={sections.includes(section)}
                  onChange={() => toggleSection(section)}
                  className="h-4 w-4 accent-[var(--color-signal)]"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  {section}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Accent
            </span>
            <input
              value={accentColor}
              onChange={(event) => setAccentColor(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-signal)]"
              placeholder="#ff4500"
            />
          </label>

          <label className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Text
            </span>
            <input
              value={textColor}
              onChange={(event) => setTextColor(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-signal)]"
              placeholder="#e5e2e1"
            />
          </label>

          <label className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Background
            </span>
            <input
              value={backgroundColor}
              onChange={(event) => setBackgroundColor(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-signal)]"
              placeholder="#080a0c"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => void saveCard()} disabled={saving || loadingPublished}>
            {saving ? "Saving..." : "Save Card"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadPublishedCard()}
            disabled={saving || loadingPublished}
          >
            {loadingPublished ? "Loading..." : "Load Public Card"}
          </Button>
          {previewUrl ? (
            <Button href={previewUrl} variant="ghost" target="_blank" rel="noreferrer">
              Open Public Page
            </Button>
          ) : null}
        </div>

        {saveMessage ? (
          <p className="border border-[hsla(153_100%_69%_/_0.35)] bg-[hsla(153_100%_69%_/_0.09)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            {saveMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="border border-[hsla(6_93%_61%_/_0.42)] bg-[hsla(6_93%_61%_/_0.12)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section id="card-editor-result" className="hud-panel space-y-4 p-6">
        <h2 className="font-headline text-2xl font-semibold tracking-tight">Published Card Data</h2>

        {publishedCard ? (
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Slug
              </span>{" "}
              {publishedCard.slug}
            </p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Owner
              </span>{" "}
              {publishedCard.owner.displayName} (@{publishedCard.owner.username})
            </p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Theme/Layout
              </span>{" "}
              {publishedCard.theme} / {publishedCard.layout}
            </p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Sections
              </span>{" "}
              {publishedCard.sections.join(", ")}
            </p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                View Count
              </span>{" "}
              {publishedCard.viewCount}
            </p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Updated
              </span>{" "}
              {new Date(publishedCard.updatedAt).toLocaleString()}
            </p>
            {publishedCard.imageUrl ? (
              <a
                href={publishedCard.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[var(--color-signal)] underline underline-offset-4"
              >
                Open generated card image
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">
            No public card payload loaded yet.
          </p>
        )}

        {savedCard ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            LAST_SAVE: {savedCard.slug} ({savedCard.theme}/{savedCard.layout})
          </p>
        ) : null}
      </section>
    </section>
  );
}
