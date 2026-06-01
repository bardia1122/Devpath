import { and, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { roadmaps, skillProgress, users } from "./schema";
import type { GraphData } from "@/types";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function upsertUser(input: {
  githubId: string;
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
  githubAccessToken?: string | null;
}) {
  const [row] = await db
    .insert(users)
    .values({
      githubId: input.githubId,
      username: input.username,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
      githubAccessToken: input.githubAccessToken ?? null,
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        username: input.username,
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
        githubAccessToken: input.githubAccessToken ?? null,
      },
    })
    .returning();

  return row;
}

export async function getUserByUsername(username: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Roadmaps
// ---------------------------------------------------------------------------

export async function createRoadmap(input: {
  userId: string;
  title: string;
  targetRole: string;
  currentSkills: string[];
  graphData: GraphData;
}) {
  const [row] = await db
    .insert(roadmaps)
    .values({
      userId: input.userId,
      title: input.title,
      targetRole: input.targetRole,
      currentSkills: input.currentSkills,
      graphData: input.graphData,
    })
    .returning();
  return row;
}

export async function getRoadmapsByUserId(userId: string) {
  return db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.userId, userId))
    .orderBy(desc(roadmaps.updatedAt));
}

export async function getRoadmapById(id: string) {
  const [row] = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateRoadmap(
  id: string,
  userId: string,
  patch: Partial<{
    title: string;
    targetRole: string;
    isPublic: boolean;
    graphData: GraphData;
  }>,
) {
  const [row] = await db
    .update(roadmaps)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(roadmaps.id, id), eq(roadmaps.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteRoadmap(id: string, userId: string) {
  const [row] = await db
    .delete(roadmaps)
    .where(and(eq(roadmaps.id, id), eq(roadmaps.userId, userId)))
    .returning();
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function getProgressForRoadmap(roadmapId: string) {
  return db
    .select()
    .from(skillProgress)
    .where(eq(skillProgress.roadmapId, roadmapId));
}

/** Returns the list of completed skill ids for a roadmap. */
export async function getCompletedSkillIds(roadmapId: string) {
  const rows = await getProgressForRoadmap(roadmapId);
  return rows.filter((r) => r.completed).map((r) => r.skillId);
}

/** Set the completed state for a single skill (upsert by roadmap + skill). */
export async function setSkillProgress(
  roadmapId: string,
  skillId: string,
  completed: boolean,
) {
  const [existing] = await db
    .select()
    .from(skillProgress)
    .where(
      and(
        eq(skillProgress.roadmapId, roadmapId),
        eq(skillProgress.skillId, skillId),
      ),
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(skillProgress)
      .set({ completed, completedAt: completed ? new Date() : null })
      .where(eq(skillProgress.id, existing.id))
      .returning();
    return row;
  }

  const [row] = await db
    .insert(skillProgress)
    .values({
      roadmapId,
      skillId,
      completed,
      completedAt: completed ? new Date() : null,
    })
    .returning();
  return row;
}
