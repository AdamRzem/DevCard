export type ProjectPlatform = "web" | "mobile";
export type ProjectGroup = "featured" | "open-source" | "experiments";

export interface DashboardProject {
  id: string;
  title: string;
  codeName: string;
  summary: string;
  githubUrl: string;
  platform: ProjectPlatform;
  group: ProjectGroup;
  tags: string[];
}

export const webProjects: DashboardProject[] = [
  {
    id: "dev-card",
    title: "DevCard",
    codeName: "THE_MONOLITH",
    summary: "GitHub portfolio visualizer with recruiter-first public profile links.",
    githubUrl: "https://github.com/AdamRzem/dev-card",
    platform: "web",
    group: "featured",
    tags: ["nextjs", "typescript", "aws"],
  },
  {
    id: "portfolio-web",
    title: "Portfolio Web",
    codeName: "VOID_STRATA",
    summary: "Personal web portfolio focused on project storytelling and performance.",
    githubUrl: "https://github.com/AdamRzem",
    platform: "web",
    group: "featured",
    tags: ["react", "ui", "motion"],
  },
  {
    id: "eye-fridge-web",
    title: "eyeFridge Web Dashboard",
    codeName: "SIGNAL_TOWER",
    summary: "Technical olympiad project dashboard for diagnostics and telemetry views.",
    githubUrl: "https://github.com/AdamRzem/eye-fridge",
    platform: "web",
    group: "open-source",
    tags: ["python", "dashboards", "iot"],
  },
  {
    id: "hackathon-night",
    title: "Hackathon Night App",
    codeName: "KINETIC_SHELL",
    summary: "Rapid MVP built under hackathon pressure with production-minded UI patterns.",
    githubUrl: "https://github.com/AdamRzem/hackathon-night-app",
    platform: "web",
    group: "experiments",
    tags: ["mvp", "react", "api"],
  },
];

export const mobileProjects: DashboardProject[] = [
  {
    id: "mobile-hud",
    title: "Monolith Mobile HUD",
    codeName: "NODE_MOBILE_01",
    summary: "Mobile diagnostics interface with terminal overlays and telemetry states.",
    githubUrl: "https://github.com/AdamRzem",
    platform: "mobile",
    group: "featured",
    tags: ["expo", "react-native", "hud"],
  },
  {
    id: "hackathon-mobile",
    title: "Hackathon Mobile Client",
    codeName: "NODE_MOBILE_02",
    summary: "Companion mobile app for prototype demos and live field validation.",
    githubUrl: "https://github.com/AdamRzem",
    platform: "mobile",
    group: "open-source",
    tags: ["typescript", "expo", "offline"],
  },
  {
    id: "scanner-mobile",
    title: "Geometry Scanner",
    codeName: "NODE_MOBILE_03",
    summary: "Mobile-first scanning workflow for structural capture and annotation.",
    githubUrl: "https://github.com/AdamRzem",
    platform: "mobile",
    group: "experiments",
    tags: ["camera", "sensors", "analysis"],
  },
];
