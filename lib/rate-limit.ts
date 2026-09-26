import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";
import { logger } from "@/lib/logger";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix ms timestamp when the window resets. */
  reset: number;
};

/**
 * In-memory sliding-window fallback used when Redis isn't configured
 * (local dev, or a deploy that hasn't wired Upstash up yet).
 *
 * NOTE: this only limits requests hitting *this* server instance — on a
 * multi-instance serverless deployment each instance gets its own counters,
 * so it's a best-effort safety net, not a real limit. Configure
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN in production so limits
 * are enforced globally.
 */
class MemoryWindow {
  private hits = new Map<string, number[]>();

  constructor(
    private limit: number,
    private windowMs: number,
  ) {}

  take(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const existing = (this.hits.get(key) ?? []).filter(
      (t) => t > windowStart,
    );
    existing.push(now);
    this.hits.set(key, existing);

    // Bound memory: opportunistically forget stale keys.
    if (this.hits.size > 5000) {
      for (const [k, times] of this.hits) {
        if (times.every((t) => t <= windowStart)) this.hits.delete(k);
      }
    }

    const success = existing.length <= this.limit;
    return {
      success,
      limit: this.limit,
      remaining: Math.max(0, this.limit - existing.length),
      reset: windowStart + this.windowMs + this.windowMs,
    };
  }
}

type LimiterConfig = {
  /** Requests allowed per window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
  /** Prefix so different limiters don't collide on the same key. */
  prefix: string;
};

function buildLimiter(config: LimiterConfig) {
  const redis = getRedis();
  const upstash = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          config.limit,
          `${config.windowSeconds} s`,
        ),
        prefix: config.prefix,
        analytics: false,
      })
    : null;
  const memory = new MemoryWindow(config.limit, config.windowSeconds * 1000);

  return {
    async limit(identifier: string): Promise<RateLimitResult> {
      if (upstash) {
        try {
          const result = await upstash.limit(identifier);
          return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
          };
        } catch (err) {
          // Redis hiccup shouldn't take the whole API down — fail open via
          // the in-memory limiter instead.
          logger.warn("rate_limit.redis_error_fallback", {
            prefix: config.prefix,
            message: err instanceof Error ? err.message : String(err),
          });
          return memory.take(`${config.prefix}:${identifier}`);
        }
      }
      return memory.take(`${config.prefix}:${identifier}`);
    },
  };
}

// Public read endpoints (casefiles/dod/signals/hall-of-noise GET): generous,
// mainly to blunt scraping/abuse rather than normal browsing.
export const publicApiLimiter = buildLimiter({
  limit: 120,
  windowSeconds: 60,
  prefix: "rl:public",
});

// Admin login: tight, to slow down password guessing. Keyed by IP.
export const loginLimiter = buildLimiter({
  limit: 8,
  windowSeconds: 15 * 60,
  prefix: "rl:login",
});

// Authenticated admin write/read endpoints: looser than login, still capped.
export const adminApiLimiter = buildLimiter({
  limit: 120,
  windowSeconds: 60,
  prefix: "rl:admin",
});

// File uploads: expensive (storage + bandwidth), so limited more tightly.
export const uploadLimiter = buildLimiter({
  limit: 10,
  windowSeconds: 60 * 60,
  prefix: "rl:upload",
});

export const globalApiLimiter = buildLimiter({
  limit: 300,
  windowSeconds: 60,
  prefix: "rl:global",
});

/** Best-effort client IP extraction behind Vercel/other proxies. */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}