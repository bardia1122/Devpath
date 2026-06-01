import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateRoadmap } from "@/lib/ai/generateRoadmap";
import { createRoadmap } from "@/lib/db/queries";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  currentSkills: z.array(z.string()).default([]),
  targetRole: z.string().min(1, "Target role is required"),
  title: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", details: String(err) },
      { status: 400 },
    );
  }

  const cleanedSkills = input.currentSkills
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const graphData = await generateRoadmap(cleanedSkills, input.targetRole);

    const title =
      input.title?.trim() ||
      `${cleanedSkills[0] ?? "Your skills"} → ${input.targetRole}`;

    const roadmap = await createRoadmap({
      userId: session.user.id,
      title,
      targetRole: input.targetRole,
      currentSkills: cleanedSkills,
      graphData,
    });

    return NextResponse.json({ roadmap }, { status: 201 });
  } catch (err) {
    console.error("Roadmap generation failed:", err);
    const message =
      err instanceof Error ? err.message : "Roadmap generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
