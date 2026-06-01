import { z } from "zod";
import type { GraphData } from "@/types";
import { layoutGraph } from "@/lib/layout";
import { complete } from "@/lib/ai/providers";

const resourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum(["docs", "course", "book", "video"]).catch("docs"),
});

const nodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z
    .enum(["frontend", "backend", "devops", "soft-skills", "architecture"])
    .catch("backend"),
  status: z.enum(["known", "to-learn"]).catch("to-learn"),
  priority: z.enum(["critical", "recommended", "optional"]).catch("recommended"),
  description: z.string().default(""),
  resources: z.array(resourceSchema).default([]),
});

const graphSchema = z.object({
  nodes: z.array(nodeSchema).min(1),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
    }),
  ),
});

function buildPrompt(currentSkills: string[], targetRole: string): string {
  return `You are a senior engineering career coach. Generate a learning roadmap.

Current skills: ${currentSkills.length ? currentSkills.join(", ") : "(none provided)"}
Target role: ${targetRole}

Return ONLY a valid JSON object with this exact shape:
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Skill Name",
      "category": "frontend|backend|devops|soft-skills|architecture",
      "status": "known|to-learn",
      "priority": "critical|recommended|optional",
      "description": "One sentence on why this skill matters",
      "resources": [
        { "title": "Resource name", "url": "https://...", "type": "docs|course|book|video" }
      ]
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-id-1", "target": "node-id-2" }
  ]
}

Rules:
- Mark skills the user already has as status "known"; everything else "to-learn".
- Create 15-25 nodes total.
- Edges represent prerequisite relationships (source must be learned before target).
- Ensure the graph is a valid DAG (no cycles).
- Include 2-3 real, well-known resources per node with working URLs.
- Use short, stable ids (e.g. "react-fundamentals").
- Respond with the JSON object only — no markdown fences, no prose.`;
}

/** Extract the first balanced JSON object from a model response. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return candidate.slice(start, end + 1);
}

/**
 * Generate a positioned roadmap graph for the given skills + target role.
 * Uses the configured AI provider (Anthropic or an OpenAI-compatible Grok/Groq
 * endpoint). Throws if no provider is configured or the model returns unusable
 * output.
 */
export async function generateRoadmap(
  currentSkills: string[],
  targetRole: string,
): Promise<GraphData> {
  const text = await complete({
    prompt: buildPrompt(currentSkills, targetRole),
    maxTokens: 4096,
  });

  const parsed = graphSchema.parse(JSON.parse(extractJson(text)));

  // Drop dangling edges that reference missing nodes.
  const ids = new Set(parsed.nodes.map((n) => n.id));
  const edges = parsed.edges.filter(
    (e) => ids.has(e.source) && ids.has(e.target),
  );

  return layoutGraph({ nodes: parsed.nodes, edges } as GraphData);
}
