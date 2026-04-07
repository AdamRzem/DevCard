import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    githubLogin?: string;
    avatarUrl?: string;
  }

  interface Session {
    accessToken?: string;
    githubId?: string;
    user: DefaultSession["user"] & {
      githubLogin?: string;
      avatarUrl?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    githubId?: string;
    githubLogin?: string;
    avatarUrl?: string;
  }
}