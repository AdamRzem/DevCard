"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

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

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const currentAttr = document.documentElement.getAttribute(THEME_ATTR);

    const initialTheme: Theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : currentAttr === "light" || currentAttr === "dark"
          ? currentAttr
          : getSystemTheme();

    applyTheme(initialTheme);
    setTheme(initialTheme);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemThemeChange = () => {
      const persistedTheme = localStorage.getItem(STORAGE_KEY);
      if (persistedTheme === "light" || persistedTheme === "dark") {
        return;
      }
      const nextTheme = getSystemTheme();
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };

    media.addEventListener("change", handleSystemThemeChange);
    return () => media.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-secondary)] transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease-smooth)] hover:-translate-y-px hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle color mode"}
      title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle color mode"}
    >
      {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
    </button>
  );
}
