import { handlers } from "@/lib/auth";

// NextAuth (Auth.js v5) route handlers. Runs in the Node runtime so the
// `jwt` callback can reach Postgres.
export const runtime = "nodejs";
export const { GET, POST } = handlers;
