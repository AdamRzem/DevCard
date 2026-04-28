import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import "./globals.css";

const themeInitScript = `(() => {
  try {
    const storageKey = "devcard-theme";
    const storedTheme = localStorage.getItem(storageKey);
    const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : systemTheme;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();`;

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DevCard",
    template: "%s | DevCard",
  },
  description:
    "Generate a beautiful developer card from your GitHub profile and share it with recruiters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        {children}
      </body>
    </html>
  );
}
