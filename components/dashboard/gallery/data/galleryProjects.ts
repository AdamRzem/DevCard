export type MuseumRoom = "web" | "mobile" | "github-stats";

export type GalleryProject = {
  id: string;
  codeName: string;
  title: string;
  summary: string;
  tags: string[];
  githubUrl: string;
  room: MuseumRoom;
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
  // WEB ROOM
  {
    id: "dev-card",
    codeName: "THE_MONOLITH",
    title: "DevCard",
    summary: "GitHub portfolio visualizer with recruiter-first public profile links and 3D museum showcase.",
    tags: ["nextjs", "typescript", "supabase", "threejs"],
    githubUrl: "https://github.com/AdamRzem/dev-card",
    room: "web",
    exhibitNumber: "W-01",
    accentColor: "#b87a3a",
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
    id: "portfolio-os",
    codeName: "SHELL_SURFACE",
    title: "Portfolio OS",
    summary: "Drag-and-drop window interface inspired by desktop operating systems, built for interactive storytelling.",
    tags: ["react", "framer-motion", "typescript"],
    githubUrl: "https://github.com/AdamRzem",
    room: "web",
    exhibitNumber: "W-02",
    accentColor: "#5a7fa8",
    year: 2026,
    mediaType: "diagram",
    highlights: [
      "Draggable window system with z-index management",
      "Custom scrollytelling transitions between sections",
      "Fluid motion design using Framer Motion spring physics",
    ],
    techStack: ["React", "TypeScript", "Framer Motion", "Tailwind CSS"],
  },
  {
    id: "web-dashboard",
    codeName: "GRID_SIGNAL",
    title: "Analytics Dashboard",
    summary: "Real-time data visualization dashboard with customizable widget layout and live metric streams.",
    tags: ["nextjs", "recharts", "websocket"],
    githubUrl: "https://github.com/AdamRzem",
    room: "web",
    exhibitNumber: "W-03",
    accentColor: "#8a6eb8",
    year: 2025,
    mediaType: "diagram",
    highlights: [
      "Live WebSocket data feeds with reconnection logic",
      "Drag-to-reorder widget grid with persistent layout",
      "Dark-mode first design system",
    ],
    techStack: ["Next.js", "Recharts", "WebSocket", "PostgreSQL"],
  },

  // MOBILE ROOM
  {
    id: "hackathon-night",
    codeName: "KINETIC_SHELL",
    title: "Hackathon Night App",
    summary: "Rapid MVP built under hackathon pressure with production-minded UI patterns.",
    tags: ["react", "api", "mvp", "ui"],
    githubUrl: "https://github.com/AdamRzem/hackathon-night-app",
    room: "mobile",
    exhibitNumber: "M-01",
    accentColor: "#7a5c8a",
    year: 2026,
    award: "1st Place — Hackathon Coding Night ZSEM 2026",
    mediaType: "diagram",
    highlights: [
      "End-to-end build in a single night with scoped releases",
      "Realtime scoreboard and status updates for participants",
      "Polished UI kit for fast iteration under time pressure",
    ],
    techStack: ["React", "TypeScript", "Node.js", "Vite"],
  },
  {
    id: "mobile-finance",
    codeName: "LEDGER_ZERO",
    title: "Finance Tracker",
    summary: "Personal finance mobile app with category budgeting, spending charts, and export to PDF.",
    tags: ["react-native", "expo", "sqlite"],
    githubUrl: "https://github.com/AdamRzem",
    room: "mobile",
    exhibitNumber: "M-02",
    accentColor: "#6a9a72",
    year: 2025,
    mediaType: "none",
    highlights: [
      "Offline-first with SQLite local storage",
      "Category budgets with monthly rollover tracking",
      "One-tap PDF export for monthly summaries",
    ],
    techStack: ["React Native", "Expo", "SQLite", "Victory Charts"],
  },

  // GITHUB STATS ROOM
  {
    id: "eyefridge",
    codeName: "PROJECT_EYEFRIDGE",
    title: "eyeFridge",
    summary: "AI-powered fridge inventory system for automated stock insight using computer vision.",
    tags: ["python", "computer-vision", "iot", "raspberry-pi"],
    githubUrl: "https://github.com/AdamRzem/eyeFridge",
    room: "github-stats",
    exhibitNumber: "S-01",
    accentColor: "#5a8a6e",
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
    id: "contribution-tracker",
    codeName: "STREAK_ENGINE",
    title: "Contribution Tracker",
    summary: "GitHub activity visualizer that turns contribution graphs into animated timeline narratives.",
    tags: ["typescript", "github-api", "d3"],
    githubUrl: "https://github.com/AdamRzem",
    room: "github-stats",
    exhibitNumber: "S-02",
    accentColor: "#a87a4a",
    year: 2025,
    mediaType: "diagram",
    highlights: [
      "GitHub GraphQL API integration for live contribution data",
      "Animated SVG timeline with D3 transitions",
      "Language breakdown and streak statistics",
    ],
    techStack: ["TypeScript", "D3.js", "GitHub GraphQL API", "SVG"],
  },
  {
    id: "code-analytics",
    codeName: "LENS_STATIC",
    title: "Code Analytics",
    summary: "Static analysis tool that scans repositories and produces complexity and coverage heat maps.",
    tags: ["python", "ast", "cli", "visualization"],
    githubUrl: "https://github.com/AdamRzem",
    room: "github-stats",
    exhibitNumber: "S-03",
    accentColor: "#8a5a5a",
    year: 2024,
    mediaType: "none",
    highlights: [
      "AST-based complexity scoring per function",
      "Repository-wide coverage heat map as SVG",
      "CLI with watch mode for continuous analysis",
    ],
    techStack: ["Python", "AST", "Click", "SVG"],
  },
];

export const roomMeta: Record<MuseumRoom, { label: string; doorLabel: string; color: string }> = {
  web: { label: "WEB DEVELOPMENT", doorLabel: "WEB", color: "#b87a3a" },
  mobile: { label: "MOBILE APPLICATIONS", doorLabel: "MOBILE", color: "#7a5c8a" },
  "github-stats": { label: "GITHUB & STATISTICS", doorLabel: "GITHUB STATS", color: "#5a8a6e" },
};
