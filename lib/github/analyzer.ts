import type {
  ContributionCalendarData,
  GitHubProfileData,
  GitHubRepository,
} from "@/lib/github/graphql";
import type { RepoCommitActivity, RepoLanguagesBreakdown } from "@/lib/github/rest";

const FALLBACK_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3776AB",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  "C#": "#239120",
  C: "#555555",
  "C++": "#F34B7D",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
};

export interface AnalyzerRepoInput {
  repository: GitHubRepository;
  languages: RepoLanguagesBreakdown;
  commitActivity: RepoCommitActivity;
  isPinned: boolean;
}

export interface AnalyzeProfileInput {
  profile: GitHubProfileData;
  contributions: ContributionCalendarData;
  repos: AnalyzerRepoInput[];
}

export interface AnalyzedLanguage {
  name: string;
  percentage: number;
  color: string;
}

export interface AnalyzedRepoImpact {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  languageColor: string;
  topics: string[];
  impactScore: number;
  url: string;
  pushedAt: string;
  commitTotal: number;
  isPinned: boolean;
}

export interface AnalyzeProfileResult {
  profile: {
    name: string | null;
    login: string;
    avatarUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    followers: number;
    following: number;
  };
  totalStars: number;
  totalContributions: number;
  publicRepos: number;
  topLanguages: AnalyzedLanguage[];
  streakData: {
    current: number;
    longest: number;
  };
  reposByImpact: AnalyzedRepoImpact[];
  topRepos: AnalyzedRepoImpact[];
  skillTags: string[];
  contributionCalendar: ContributionCalendarData["weeks"];
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function sumCommitActivity(commitActivity: RepoCommitActivity) {
  if (!commitActivity) {
    return 0;
  }

  return commitActivity.reduce((sum, week) => sum + week.total, 0);
}

function getRecencyMultiplier(pushedAt: string) {
  const pushedAtTime = new Date(pushedAt).getTime();

  if (!Number.isFinite(pushedAtTime)) {
    return 0.35;
  }

  const daysSincePush = Math.max(0, (Date.now() - pushedAtTime) / (1000 * 60 * 60 * 24));

  return Math.max(0.35, 1 - daysSincePush / 730);
}

function calculateStreakData(contributions: ContributionCalendarData) {
  const days = contributions.weeks
    .flatMap((week) => week.contributionDays)
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date));

  let longest = 0;
  let running = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;
  let cursor = days.length - 1;
  const todayIso = new Date().toISOString().slice(0, 10);

  if (
    cursor >= 0 &&
    days[cursor].date === todayIso &&
    days[cursor].contributionCount === 0
  ) {
    cursor -= 1;
  }

  while (cursor >= 0) {
    if (days[cursor].contributionCount > 0) {
      current += 1;
      cursor -= 1;
      continue;
    }

    break;
  }

  return {
    current,
    longest,
  };
}

function calculateTopLanguages(repos: AnalyzerRepoInput[]): AnalyzedLanguage[] {
  const totals = new Map<string, number>();
  const colors = new Map<string, string>();

  for (const entry of repos) {
    if (entry.repository.primaryLanguage?.name && entry.repository.primaryLanguage.color) {
      colors.set(entry.repository.primaryLanguage.name, entry.repository.primaryLanguage.color);
    }

    const languageEntries = Object.entries(entry.languages);

    if (languageEntries.length === 0) {
      const fallbackLanguage = entry.repository.primaryLanguage?.name;
      if (fallbackLanguage) {
        totals.set(fallbackLanguage, (totals.get(fallbackLanguage) ?? 0) + 1);
      }
      continue;
    }

    for (const [language, bytes] of languageEntries) {
      if (bytes <= 0) {
        continue;
      }

      totals.set(language, (totals.get(language) ?? 0) + bytes);
    }
  }

  const sortedLanguages = Array.from(totals.entries()).sort((left, right) => right[1] - left[1]);
  const totalBytes = sortedLanguages.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (totalBytes <= 0) {
    return [];
  }

  return sortedLanguages.slice(0, 6).map(([name, bytes]) => ({
    name,
    percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
    color: colors.get(name) ?? FALLBACK_LANGUAGE_COLORS[name] ?? "#94A3B8",
  }));
}

function calculateRepoImpact(repos: AnalyzerRepoInput[]): AnalyzedRepoImpact[] {
  return repos
    .map((entry) => {
      const commitTotal = sumCommitActivity(entry.commitActivity);
      const recencyMultiplier = getRecencyMultiplier(entry.repository.pushedAt);
      const impactScore = Number(
        (
          entry.repository.stargazerCount *
          Math.max(1, entry.repository.forkCount) *
          recencyMultiplier
        ).toFixed(2),
      );

      return {
        name: entry.repository.name,
        description: entry.repository.description ?? "No description provided.",
        stars: entry.repository.stargazerCount,
        forks: entry.repository.forkCount,
        language: entry.repository.primaryLanguage?.name ?? "Unknown",
        languageColor:
          entry.repository.primaryLanguage?.color ??
          FALLBACK_LANGUAGE_COLORS[entry.repository.primaryLanguage?.name ?? ""] ??
          "#94A3B8",
        topics: entry.repository.topics,
        impactScore,
        url: entry.repository.url,
        pushedAt: entry.repository.pushedAt,
        commitTotal,
        isPinned: entry.isPinned,
      };
    })
    .sort((left, right) => right.impactScore - left.impactScore);
}

function deriveSkillTags(repos: AnalyzerRepoInput[], topLanguages: AnalyzedLanguage[]) {
  const frequencies = new Map<string, number>();

  for (const entry of repos) {
    for (const topic of entry.repository.topics) {
      const normalized = normalizeTag(topic);
      if (!normalized) {
        continue;
      }

      frequencies.set(normalized, (frequencies.get(normalized) ?? 0) + 3);
    }

    const primaryLanguage = entry.repository.primaryLanguage?.name;
    if (primaryLanguage) {
      const normalized = normalizeTag(primaryLanguage);
      frequencies.set(normalized, (frequencies.get(normalized) ?? 0) + 2);
    }

    for (const language of Object.keys(entry.languages)) {
      const normalized = normalizeTag(language);
      frequencies.set(normalized, (frequencies.get(normalized) ?? 0) + 1);
    }
  }

  for (const language of topLanguages) {
    const normalized = normalizeTag(language.name);
    frequencies.set(normalized, (frequencies.get(normalized) ?? 0) + 2);
  }

  return Array.from(frequencies.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, 12)
    .map(([skill]) => toTitleCase(skill));
}

export function analyzeProfile(input: AnalyzeProfileInput): AnalyzeProfileResult {
  const topLanguages = calculateTopLanguages(input.repos);
  const streakData = calculateStreakData(input.contributions);
  const reposByImpact = calculateRepoImpact(input.repos);
  const skillTags = deriveSkillTags(input.repos, topLanguages);
  const totalStars = input.repos.reduce(
    (sum, entry) => sum + entry.repository.stargazerCount,
    0,
  );

  return {
    profile: {
      name: input.profile.name,
      login: input.profile.login,
      avatarUrl: input.profile.avatarUrl,
      bio: input.profile.bio,
      company: input.profile.company,
      location: input.profile.location,
      followers: input.profile.followers,
      following: input.profile.following,
    },
    totalStars,
    totalContributions: input.contributions.totalContributions,
    publicRepos: input.profile.publicRepos,
    topLanguages,
    streakData,
    reposByImpact,
    topRepos: reposByImpact.slice(0, 6),
    skillTags,
    contributionCalendar: input.contributions.weeks,
  };
}
