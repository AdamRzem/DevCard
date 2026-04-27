export type GalleryRoom = "main-hall" | "ai-wing" | "experimental-lab" | "archive";

export type GalleryProject = {
  id: string;
  codeName: string;
  title: string;
  summary: string;
  tags: string[];
  githubUrl: string;
  group: "featured" | "open-source" | "experiments";
  room: GalleryRoom;
  exhibitNumber: string;
  accentColor: string;
  year: number;
  award?: string;
  mediaType: "screenshot" | "diagram" | "code" | "none";
  mediaUrl?: string;
  highlights: string[];
  techStack: string[];
};

export const galleryProjects: GalleryProject[] = [
  {
    id: "dev-card",
    codeName: "THE_MONOLITH",
    title: "DevCard",
    summary: "GitHub portfolio visualizer with recruiter-first public profile links.",
    tags: ["nextjs", "typescript", "supabase", "threejs"],
    githubUrl: "https://github.com/AdamRzem/dev-card",
    group: "featured",
    room: "main-hall",
    exhibitNumber: "G-01",
    accentColor: "#ff5a1f",
    year: 2026,
    mediaType: "diagram",
    highlights: [
      "App Router architecture tuned for recruiter-first profile sharing",
      "Supabase-backed sync pipeline for GitHub data and card storage",
      "Dual-mode showcase with 3D museum and 2D OS fallback",
    ],
    techStack: ["Next.js", "TypeScript", "Supabase", "Three.js", "Framer Motion"],
  },
  {
    id: "eyefridge",
    codeName: "PROJECT_EYEFRIDGE",
    title: "eyeFridge",
    summary: "AI-powered fridge inventory system for automated stock insight.",
    tags: ["python", "computer-vision", "iot", "raspberry-pi"],
    githubUrl: "https://github.com/AdamRzem/eyeFridge",
    group: "featured",
    room: "ai-wing",
    exhibitNumber: "G-02",
    accentColor: "#12f58d",
    year: 2025,
    award: "Technical Innovation Olympiad Laureate",
    mediaType: "screenshot",
    highlights: [
      "Real-time item detection from a custom vision model",
      "Inventory alerts with expiry and restock automation",
      "Edge deployment tuned for Raspberry Pi performance",
    ],
    techStack: ["Python", "FastAPI", "PostgreSQL", "Docker", "Next.js"],
  },
  {
    id: "hackathon-night",
    codeName: "KINETIC_SHELL",
    title: "Hackathon Night App",
    summary: "Rapid MVP built under hackathon pressure with production-minded UI patterns.",
    tags: ["react", "api", "mvp", "ui"],
    githubUrl: "https://github.com/AdamRzem/hackathon-night-app",
    group: "experiments",
    room: "experimental-lab",
    exhibitNumber: "G-03",
    accentColor: "#f8c24b",
    year: 2026,
    award: "Hackathon Coding Night Winner",
    mediaType: "diagram",
    highlights: [
      "End-to-end build in a single night with scoped releases",
      "Realtime scoreboard and status updates for participants",
      "Polished UI kit for fast iteration under time pressure",
    ],
    techStack: ["React", "TypeScript", "Node.js", "Vite"],
  },
];
