import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local first (Next.js convention for local secrets), then fall back
// to .env. dotenv never overrides already-set vars, so .env.local wins.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
