import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

type GitHubProfile = {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

function hasValue(value?: string) {
  if (!value) {
    return false;
  }

  const normalized = value.trim();
  return normalized.length > 0 && !normalized.startsWith("MANUAL_REPLACE");
}

export function hasRequiredAuthEnv() {
  return (
    hasValue(process.env.AUTH_SECRET) &&
    hasValue(process.env.AUTH_GITHUB_ID) &&
    hasValue(process.env.AUTH_GITHUB_SECRET)
  );
}

const authEnvReady = hasRequiredAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authEnvReady ? process.env.AUTH_SECRET : undefined,
  providers: authEnvReady
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID!,
          clientSecret: process.env.AUTH_GITHUB_SECRET!,
          authorization: {
            params: {
              scope: "read:user",
            },
          },
          profile(profile: GitHubProfile) {
            return {
              id: String(profile.id),
              name: profile.name ?? profile.login,
              email: profile.email ?? undefined,
              image: profile.avatar_url ?? undefined,
              githubLogin: profile.login,
              avatarUrl: profile.avatar_url ?? undefined,
            };
          },
        }),
      ]
    : [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = account.providerAccountId;
      }

      if (profile && "login" in profile) {
        token.githubLogin = String(profile.login);
      }

      if (profile && "avatar_url" in profile && profile.avatar_url) {
        token.avatarUrl = String(profile.avatar_url);
      }

      if (user) {
        token.githubLogin = token.githubLogin ?? user.githubLogin;
        token.avatarUrl = token.avatarUrl ?? user.avatarUrl ?? user.image;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.githubId = token.githubId as string | undefined;

      if (session.user) {
        session.user.githubLogin = token.githubLogin as string | undefined;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }

      return session;
    },
  },
});