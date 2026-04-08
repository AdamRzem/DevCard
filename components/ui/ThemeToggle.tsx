"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";
type ThemeState = {
  theme: Theme;
  hasExplicitPreference: boolean;
};

const STORAGE_KEY = "devcard-theme";
const THEME_ATTR = "data-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute(THEME_ATTR, theme);
  root.style.colorScheme = theme;
}

function safeStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode, blocked storage, etc.).
  }
}

function safeStorageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage remove failures.
  }
}

function getInitialThemeState(): ThemeState {
  if (typeof window === "undefined") {
    return {
      theme: "dark",
      hasExplicitPreference: false,
    };
  }

  const savedTheme = safeStorageGet(STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return {
      theme: savedTheme,
      hasExplicitPreference: true,
    };
  }

  const currentAttr = document.documentElement.getAttribute(THEME_ATTR);
  if (currentAttr === "dark" || currentAttr === "light") {
    return {
      theme: currentAttr,
      hasExplicitPreference: false,
    };
  }

  return {
    theme: getSystemTheme(),
    hasExplicitPreference: false,
  };
}

export function ThemeToggle() {
  const [themeState, setThemeState] = useState(getInitialThemeState);
  const theme = themeState.theme;
  const nextThemeLabel = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    applyTheme(theme);

    if (themeState.hasExplicitPreference) {
      safeStorageSet(STORAGE_KEY, theme);
    } else {
      safeStorageRemove(STORAGE_KEY);
    }
  }, [theme, themeState.hasExplicitPreference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemThemeChange = () => {
      setThemeState((currentThemeState) => {
        if (currentThemeState.hasExplicitPreference) {
          return currentThemeState;
        }

        const nextTheme = getSystemTheme();
        if (currentThemeState.theme === nextTheme) {
          return currentThemeState;
        }

        return {
          ...currentThemeState,
          theme: nextTheme,
        };
      });
    };

    media.addEventListener("change", handleSystemThemeChange);
    return () => media.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((currentThemeState) => ({
      theme: currentThemeState.theme === "dark" ? "light" : "dark",
      hasExplicitPreference: true,
    }));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-secondary)] transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease-smooth)] hover:-translate-y-px hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
