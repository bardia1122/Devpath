import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  getRoadmapById,
  setSkillProgress,
} from "@/lib/db/queries";

export const runtime = "nodejs";

const bodySchema = z.object({
  roadmapId: z.string().uuid(),
  skillId: z.string().min(1),
  completed: z.boolean(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", details: String(err) },
      { status: 400 },
    );
  }

  // Only the owner can mutate progress.
  const roadmap = await getRoadmapById(body.roadmapId);
  if (!roadmap) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = await setSkillProgress(
    body.roadmapId,
    body.skillId,
    body.completed,
  );
  return NextResponse.json({ progress: row });
}
