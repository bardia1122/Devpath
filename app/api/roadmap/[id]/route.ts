import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  deleteRoadmap,
  getCompletedSkillIds,
  getRoadmapById,
  updateRoadmap,
} from "@/lib/db/queries";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;

  // GET is reachable without auth (public roadmaps), so guard by IP.
  const limited = enforceRateLimits([
    { key: `roadmap-get:ip:${getClientIp(req)}`, limit: 120, windowMs: 60_000 },
  ]);
  if (limited) return limited;

  const roadmap = await getRoadmapById(id);
  if (!roadmap) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const isOwner = session?.user?.id === roadmap.userId;
  if (!roadmap.isPublic && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const completed = await getCompletedSkillIds(id);
  return NextResponse.json({ roadmap, completed, isOwner });
}

const patchSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  targetRole: z.string().min(1).max(120).optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = enforceRateLimits([
    { key: `roadmap-write:user:${session.user.id}`, limit: 60, windowMs: 60_000 },
  ]);
  if (limited) return limited;

  let patch: z.infer<typeof patchSchema>;
  try {
    patch = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await updateRoadmap(id, session.user.id, patch);
  if (!updated) {
    return NextResponse.json(
      { error: "Not found or not owned by you" },
      { status: 404 },
    );
  }
  return NextResponse.json({ roadmap: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = enforceRateLimits([
    { key: `roadmap-write:user:${session.user.id}`, limit: 60, windowMs: 60_000 },
  ]);
  if (limited) return limited;

  const deleted = await deleteRoadmap(id, session.user.id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Not found or not owned by you" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
