import type { AnalyzeProfileResult } from "@/lib/github/analyzer";

export interface PublicLanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface PublicRepoHighlight {
  name: string;
  description: string;
  stars: number;
  language: string;
  languageColor: string;
  url: string;
}

export interface PublicProfile {
  slug: string;
  displayName: string;
  username: string;
  title: string;
  location: string;
  bio: string;
  totalContributions: number;
  totalStars: number;
  publicRepos: number;
  topLanguages: PublicLanguageStat[];
  topRepos: PublicRepoHighlight[];
  links: {
    github: string;
    resume: string;
    contact: string;
  };
}

export const DEMO_PUBLIC_SLUG = "adam-dev";

const sampleProfile: PublicProfile = {
  slug: DEMO_PUBLIC_SLUG,
  displayName: "Adam Rzeminski",
  username: "AdamRzem",
  title: "Fullstack Developer",
  location: "Poland",
  bio: "Building web apps, shipping hackathon ideas, and turning GitHub history into recruiter-ready proof of impact.",
  totalContributions: 2841,
  totalStars: 736,
  publicRepos: 47,
  topLanguages: [
    { name: "TypeScript", percentage: 42, color: "#3178C6" },
    { name: "React", percentage: 30, color: "#61DAFB" },
    { name: "Python", percentage: 18, color: "#3776AB" },
    { name: "Go", percentage: 10, color: "#00ADD8" },
  ],
  topRepos: [
    {
      name: "dev-card",
      description: "GitHub portfolio visualizer with shareable recruiter-first profile cards.",
      stars: 123,
      language: "TypeScript",
      languageColor: "#3178C6",
      url: "https://github.com/AdamRzem/dev-card",
    },
    {
      name: "eye-fridge",
      description: "Technical innovation prototype recognized in olympiad competition.",
      stars: 88,
      language: "Python",
      languageColor: "#3776AB",
      url: "https://github.com/AdamRzem/eye-fridge",
    },
    {
      name: "hackathon-night-app",
      description: "Winning hackathon project built for rapid MVP delivery under strict time constraints.",
      stars: 64,
      language: "React",
      languageColor: "#61DAFB",
      url: "https://github.com/AdamRzem/hackathon-night-app",
    },
  ],
  links: {
    github: "https://github.com/AdamRzem",
    resume: "https://example.com/resume.pdf",
    contact: "mailto:adam@example.com",
  },
};

const profilesBySlug: Record<string, PublicProfile> = {
  [sampleProfile.slug]: sampleProfile,
  adamrzem: {
    ...sampleProfile,
    slug: "adamrzem",
  },
};

/**
 * Get a public profile by slug.
 *
 * Static demo slugs ("adam-dev", "adamrzem") always return hardcoded data so
 * the landing page works even without a database connection.
 *
 * All other slugs query Supabase for real user data.
 */
export async function getPublicProfileBySlug(slug: string): Promise<PublicProfile | null> {
  const normalizedSlug = slug.toLowerCase();

  // Always serve static demo for known demo slugs
  const staticProfile = profilesBySlug[normalizedSlug];
  if (staticProfile) {
    return staticProfile;
  }

  // Query Supabase for real user data
  try {
    const { getUserByUsername } = await import("@/lib/supabase/queries");
    const user = await getUserByUsername(normalizedSlug);

    if (!user || !user.is_public || !user.github_data) return null;

    const data = user.github_data as AnalyzeProfileResult;

    return {
      slug: normalizedSlug,
      displayName: user.display_name ?? user.github_username,
      username: user.github_username,
      title: "Developer",
      location: user.location ?? "",
      bio: user.bio ?? "",
      totalContributions: data.totalContributions,
      totalStars: data.totalStars,
      publicRepos: data.publicRepos,
      topLanguages: data.topLanguages,
      topRepos: data.topRepos.slice(0, 3).map((r) => ({
        name: r.name,
        description: r.description,
        stars: r.stars,
        language: r.language,
        languageColor: r.languageColor,
        url: r.url,
      })),
      links: {
        github: `https://github.com/${user.github_username}`,
        resume: "",
        contact: user.email ? `mailto:${user.email}` : "",
      },
    };
  } catch (error) {
    // In development, Supabase may not be configured — fall through to null
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase profile lookup failed:", error instanceof Error ? error.message : error);
    }
    return null;
  }
}
