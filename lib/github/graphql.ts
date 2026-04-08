import { GitHubApiError } from "@/lib/github/errors";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_REQUEST_TIMEOUT_MS = 12_000;

type GraphQLErrorShape = {
  message: string;
  type?: string;
  extensions?: {
    code?: string;
    type?: string;
  };
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLErrorShape[];
};

type GraphQLVariables = Record<string, string | number | boolean | null>;

function isTimeoutLike(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

function inferGraphqlErrorStatus(errors: GraphQLErrorShape[]) {
  const combinedText = errors
    .map((entry) =>
      [entry.type, entry.extensions?.type, entry.extensions?.code, entry.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    )
    .join(" ");

  if (combinedText.includes("rate limit") || combinedText.includes("rate_limited")) {
    return 429;
  }

  if (
    combinedText.includes("bad credentials") ||
    combinedText.includes("requires authentication")
  ) {
    return 401;
  }

  if (combinedText.includes("could not resolve to a user")) {
    return 404;
  }

  return 502;
}

async function parseErrorBody(response: Response) {
  try {
    const body = (await response.json()) as {
      message?: string;
      errors?: GraphQLErrorShape[];
    };

    if (body.errors && body.errors.length > 0) {
      return body.errors.map((entry) => entry.message).join("; ");
    }

    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    return response.statusText;
  }

  return response.statusText;
}

async function githubGraphqlRequest<TData>(
  token: string,
  query: string,
  variables: GraphQLVariables,
): Promise<TData> {
  let response: Response;

  try {
    response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "User-Agent": "dev-card-app",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTimeoutLike(error)) {
      throw new GitHubApiError(504, "GitHub GraphQL request timed out.");
    }

    throw new GitHubApiError(502, "GitHub GraphQL request failed before a response was received.");
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new GitHubApiError(
      response.status,
      `GitHub GraphQL request failed (${response.status}): ${errorBody}`,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors && payload.errors.length > 0) {
    throw new GitHubApiError(
      inferGraphqlErrorStatus(payload.errors),
      payload.errors.map((entry) => entry.message).join("; "),
    );
  }

  if (!payload.data) {
    throw new GitHubApiError(502, "GitHub GraphQL response did not contain data.");
  }

  return payload.data;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendarData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubProfileData {
  name: string | null;
  login: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  avatarUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
}

export interface GitHubRepository {
  id: string;
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string | null;
  } | null;
  topics: string[];
  pushedAt: string;
  ownerLogin: string;
}

export interface GitHubTopReposData {
  pinned: GitHubRepository[];
  top: GitHubRepository[];
}

type GraphQLRepositoryNode = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  isPrivate: boolean;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string | null;
  } | null;
  repositoryTopics: {
    nodes: Array<
      | {
          topic: {
            name: string;
          } | null;
        }
      | null
    >;
  };
  pushedAt: string;
  owner: {
    login: string;
  };
};

function normalizeRepository(node: GraphQLRepositoryNode): GitHubRepository {
  const topics = node.repositoryTopics.nodes
    .map((entry) => entry?.topic?.name)
    .filter((value): value is string => Boolean(value));

  return {
    id: node.id,
    name: node.name,
    description: node.description,
    url: node.url,
    stargazerCount: node.stargazerCount,
    forkCount: node.forkCount,
    primaryLanguage: node.primaryLanguage,
    topics,
    pushedAt: node.pushedAt,
    ownerLogin: node.owner.login,
  };
}

export async function fetchContributions(
  token: string,
  username: string,
): Promise<ContributionCalendarData> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  const data = await githubGraphqlRequest<{
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendarData;
      };
    } | null;
  }>(token, query, { username });

  if (!data.user) {
    throw new GitHubApiError(404, `GitHub user ${username} was not found.`);
  }

  return data.user.contributionsCollection.contributionCalendar;
}

export async function fetchProfile(
  token: string,
  username: string,
): Promise<GitHubProfileData> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        name
        login
        bio
        company
        location
        avatarUrl
        followers { totalCount }
        following { totalCount }
        repositories(first: 1, ownerAffiliations: OWNER, privacy: PUBLIC) {
          totalCount
        }
      }
    }
  `;

  const data = await githubGraphqlRequest<{
    user: {
      name: string | null;
      login: string;
      bio: string | null;
      company: string | null;
      location: string | null;
      avatarUrl: string;
      followers: { totalCount: number };
      following: { totalCount: number };
      repositories: { totalCount: number };
    } | null;
  }>(token, query, { username });

  if (!data.user) {
    throw new GitHubApiError(404, `GitHub user ${username} was not found.`);
  }

  return {
    name: data.user.name,
    login: data.user.login,
    bio: data.user.bio,
    company: data.user.company,
    location: data.user.location,
    avatarUrl: data.user.avatarUrl,
    followers: data.user.followers.totalCount,
    following: data.user.following.totalCount,
    publicRepos: data.user.repositories.totalCount,
  };
}

export async function fetchTopRepos(
  token: string,
  username: string,
): Promise<GitHubTopReposData> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(
          first: 20
          orderBy: { field: STARGAZERS, direction: DESC }
          ownerAffiliations: OWNER
          privacy: PUBLIC
          isFork: false
        ) {
          nodes {
            id
            name
            description
            url
            isPrivate
            stargazerCount
            forkCount
            primaryLanguage { name color }
            repositoryTopics(first: 10) {
              nodes {
                topic { name }
              }
            }
            pushedAt
            owner { login }
          }
        }
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              id
              name
              description
              url
              isPrivate
              stargazerCount
              forkCount
              primaryLanguage { name color }
              repositoryTopics(first: 10) {
                nodes {
                  topic { name }
                }
              }
              pushedAt
              owner { login }
            }
          }
        }
      }
    }
  `;

  const data = await githubGraphqlRequest<{
    user: {
      repositories: {
        nodes: Array<GraphQLRepositoryNode | null>;
      };
      pinnedItems: {
        nodes: Array<GraphQLRepositoryNode | null>;
      };
    } | null;
  }>(token, query, { username });

  if (!data.user) {
    throw new GitHubApiError(404, `GitHub user ${username} was not found.`);
  }

  return {
    pinned: data.user.pinnedItems.nodes
      .filter((node): node is GraphQLRepositoryNode => node !== null && !node.isPrivate)
      .map(normalizeRepository),
    top: data.user.repositories.nodes
      .filter((node): node is GraphQLRepositoryNode => node !== null && !node.isPrivate)
      .map(normalizeRepository),
  };
}
