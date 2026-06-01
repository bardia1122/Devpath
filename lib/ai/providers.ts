import Anthropic from "@anthropic-ai/sdk";

/**
 * LLM provider abstraction.
 *
 * DevPath can generate roadmaps with either Anthropic (Claude) or any
 * OpenAI-compatible chat API. The latter covers Groq Cloud (`gsk_...` keys,
 * `https://api.groq.com/openai/v1`) and xAI Grok (`xai-...` keys,
 * `https://api.x.ai/v1`) — both speak the same `/chat/completions` shape.
 *
 * Selection order:
 *   1. `AI_PROVIDER` env, if set explicitly ("anthropic" | "grok").
 *   2. Anthropic, if `ANTHROPIC_API_KEY` is present (preferred).
 *   3. Grok/Groq, if `GROK_API_KEY` is present.
 */

export type ProviderName = "anthropic" | "grok";

export interface CompletionRequest {
  prompt: string;
  maxTokens: number;
}

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
// Groq's default. Override with GROK_MODEL (e.g. "grok-2-latest" for xAI).
const DEFAULT_GROK_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GROK_BASE_URL = "https://api.groq.com/openai/v1";

export function resolveProvider(): ProviderName {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "anthropic" || explicit === "grok") {
    return explicit;
  }
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GROK_API_KEY) return "grok";
  throw new Error(
    "No AI provider configured. Set ANTHROPIC_API_KEY or GROK_API_KEY in your environment.",
  );
}

async function completeWithAnthropic(req: CompletionRequest): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: req.maxTokens,
    messages: [{ role: "user", content: req.prompt }],
  });

  return response.content[0]?.type === "text" ? response.content[0].text : "";
}

async function completeWithGrok(req: CompletionRequest): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY is not set");

  const baseUrl = (process.env.GROK_BASE_URL ?? DEFAULT_GROK_BASE_URL).replace(
    /\/$/,
    "",
  );
  const model = process.env.GROK_MODEL ?? DEFAULT_GROK_MODEL;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  // OpenRouter uses these optional headers for app attribution/ranking. They're
  // ignored by other OpenAI-compatible providers, so it's safe to always send.
  if (baseUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    headers["X-Title"] = "DevPath";
  }

  const basePayload = {
    model,
    max_tokens: req.maxTokens,
    temperature: 0.4,
    messages: [{ role: "user", content: req.prompt }],
  };

  const send = (jsonMode: boolean) =>
    fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(
        jsonMode
          ? { ...basePayload, response_format: { type: "json_object" } }
          : basePayload,
      ),
    });

  // Prefer JSON mode, but some models/providers reject `response_format`.
  // If that's the rejection reason, retry once without it (the prompt already
  // asks for raw JSON, and the caller strips any stray prose).
  let res = await send(true);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (
      (res.status === 400 || res.status === 422) &&
      /response_format|json/i.test(detail)
    ) {
      res = await send(false);
    } else {
      throw new Error(
        `AI provider error (${res.status}) from ${baseUrl}: ${detail.slice(0, 500)}`,
      );
    }
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `AI provider error (${res.status}) from ${baseUrl}: ${detail.slice(0, 500)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Run a completion against the configured provider, returning raw text. */
export async function complete(req: CompletionRequest): Promise<string> {
  const provider = resolveProvider();
  return provider === "anthropic"
    ? completeWithAnthropic(req)
    : completeWithGrok(req);
}
