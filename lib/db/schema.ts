import {
  pgTable,
  uuid,
  text,
  jsonb,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import type { GraphData } from "@/types";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  githubId: text("github_id").unique().notNull(),
  username: text("username").unique().notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  // GitHub OAuth token; used for Phase 2 repo sync.
  githubAccessToken: text("github_access_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(), // e.g. "React → Staff Engineer"
  targetRole: text("target_role").notNull(),
  currentSkills: jsonb("current_skills").$type<string[]>(),
  graphData: jsonb("graph_data").$type<GraphData>(), // React Flow nodes + edges
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skillProgress = pgTable("skill_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  roadmapId: uuid("roadmap_id")
    .references(() => roadmaps.id, { onDelete: "cascade" })
    .notNull(),
  skillId: text("skill_id").notNull(), // matches node id in graphData
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export type UserRow = typeof users.$inferSelect;
export type RoadmapRow = typeof roadmaps.$inferSelect;
export type SkillProgressRow = typeof skillProgress.$inferSelect;
