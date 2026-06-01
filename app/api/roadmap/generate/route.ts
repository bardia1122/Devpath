import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateRoadmap } from "@/lib/ai/generateRoadmap";
import { createRoadmap } from "@/lib/db/queries";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MINUTE = 60_000;

const bodySchema = z.object({
  currentSkills: z.array(z.string()).max(50).default([]),
  targetRole: z.string().min(1, "Target role is required").max(120),
  title: z.string().max(160).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Roadmap generation is the most expensive endpoint (one AI call + DB write).
  // Cap it tightly per-user, with a per-IP backstop against multi-account abuse.
  const limited = enforceRateLimits([
    { key: `generate:user:${userId}`, limit: 5, windowMs: 5 * MINUTE },
    { key: `generate:ip:${getClientIp(req)}`, limit: 15, windowMs: 5 * MINUTE },
  ]);
  if (limited) return limited;

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
      userId,
      title,
      targetRole: input.targetRole,
      currentSkills: cleanedSkills,
      graphData,
    });

    return NextResponse.json({ roadmap }, { status: 201 });
  } catch (err) {
    // Log full detail server-side; return a generic message so internal errors
    // (provider responses, DB errors, etc.) are never leaked to the client.
    console.error("Roadmap generation failed:", err);
    return NextResponse.json(
      { error: "Could not generate a roadmap right now. Please try again." },
      { status: 502 },
    );
  }
}
