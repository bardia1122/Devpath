import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { upsertUser } from "@/lib/db/queries";

/**
 * NextAuth (Auth.js v5) configuration.
 *
 * We use a JWT session strategy (no DB adapter) and upsert the GitHub profile
 * into our custom `users` table during the `jwt` callback, so the app keeps its
 * own user shape (username, avatar, github token) rather than the adapter schema.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Trust the deployment host (required off-Vercel for Auth.js v5).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign-in, capture the GitHub identity into the token. We keep it
      // around so the DB upsert below can be retried on later requests if the
      // database happened to be unreachable during sign-in.
      if (account && profile) {
        const gh = profile as unknown as {
          id: number;
          login: string;
          name?: string | null;
          avatar_url?: string | null;
        };
        token.githubId = String(gh.id);
        token.username = gh.login;
        token.name = gh.name ?? undefined;
        token.avatarUrl = gh.avatar_url ?? undefined;
        if (account.access_token) token.githubAccessToken = account.access_token;
      }

      // Ensure we have an app user id. If the DB was down at sign-in, this runs
      // again on subsequent requests and self-heals once the DB is reachable —
      // no manual sign-out/in required.
      if (!token.userId && token.githubId) {
        try {
          const user = await upsertUser({
            githubId: token.githubId,
            username: token.username ?? token.githubId,
            name: token.name ?? null,
            avatarUrl: token.avatarUrl ?? null,
            githubAccessToken: token.githubAccessToken ?? null,
          });
          token.userId = user.id;
          token.username = user.username;
          token.avatarUrl = user.avatarUrl ?? undefined;
          token.name = user.name ?? undefined;
        } catch (err) {
          // Don't block the session if the DB is unavailable; log for visibility.
          console.error("Failed to upsert user on sign-in:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      if (token.username) session.user.username = token.username as string;
      if (token.avatarUrl) session.user.image = token.avatarUrl as string;
      if (token.name) session.user.name = token.name as string;
      return session;
    },
  },
});
