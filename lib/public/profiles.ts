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

export function getPublicProfileBySlug(slug: string): PublicProfile | null {
  const normalizedSlug = slug.toLowerCase();
  return profilesBySlug[normalizedSlug] ?? null;
}
