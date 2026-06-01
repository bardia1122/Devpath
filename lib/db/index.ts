import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Fallback keeps imports (and `next build`) from throwing when DATABASE_URL is
// absent. postgres-js connects lazily, so nothing actually dials out until the
// first query runs — at which point a missing/invalid URL surfaces a real error.
const connectionString =
  process.env.DATABASE_URL ?? "postgres://localhost:5432/devpath";

// Reuse a single client across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.pgClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
