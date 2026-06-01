import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  deleteRoadmap,
  getCompletedSkillIds,
  getRoadmapById,
  updateRoadmap,
} from "@/lib/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
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
  title: z.string().min(1).optional(),
  targetRole: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let patch: z.infer<typeof patchSchema>;
  try {
    patch = patchSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", details: String(err) },
      { status: 400 },
    );
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

  const deleted = await deleteRoadmap(id, session.user.id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Not found or not owned by you" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
