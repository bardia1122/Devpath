import { NextResponse } from "next/server";

/**
 * Lightweight in-memory rate limiter (fixed-window).
 *
 * Keeps a per-key request count that resets every `windowMs`. This protects the
 * app from a single client spamming expensive endpoints (notably AI roadmap
 * generation) and exhausting the database, the AI provider quota, or memory.
 *
 * NOTE: state lives in this process only. For a multi-instance / serverless
 * deployment, swap the `store` for a shared backend (e.g. Upstash Redis) — the
 * `checkRateLimit` signature can stay the same.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

// Survive dev hot-reloads (and avoid duplicate stores across module instances).
const globalForRl = globalThis as unknown as {
  rateLimitStore?: Map<string, Bucket>;
};
const store = globalForRl.rateLimitStore ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") {
  globalForRl.rateLimitStore = store;
}

// Cap the number of tracked keys so a flood of unique keys can't grow memory
// without bound; expired entries are purged opportunistically.
const MAX_KEYS = 20_000;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfter: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (store.size > MAX_KEYS) {
    for (const [k, b] of store) {
      if (b.resetAt <= now) store.delete(k);
    }
  }

  let bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }
  bucket.count += 1;

  return {
    success: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Best-effort client IP from common proxy headers (for IP-based limiting). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Build a 429 response with standard rate-limit headers. */
export function rateLimitedResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

/**
 * Convenience guard: check one or more rate-limit rules and return a ready 429
 * response if any is exceeded, otherwise null. Rules are checked in order; the
 * first failing rule's headers are returned.
 */
export function enforceRateLimits(
  rules: { key: string; limit: number; windowMs: number }[],
): NextResponse | null {
  for (const rule of rules) {
    const result = checkRateLimit(rule.key, rule.limit, rule.windowMs);
    if (!result.success) return rateLimitedResponse(result);
  }
  return null;
}
