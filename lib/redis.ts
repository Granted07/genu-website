import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

/**
 * Upstash Redis (REST-based, so it works from Vercel serverless/edge
 * functions without a persistent TCP connection) is used for:
 *  - shared rate-limit counters (lib/rate-limit.ts)
 *  - caching repeated reads of public content (lib/cache.ts)
 *
 * Redis is optional in development: if the env vars aren't set, callers
 * fall back to in-memory/no-op behavior so `next dev` keeps working without
 * any extra infra. In production you should configure it — see
 * docs/OPERATIONS.md for setup.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      logger.warn("redis.not_configured", {
        hint: "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — rate limiting and caching are running in single-instance fallback mode.",
      });
    }
    client = null;
    return client;
  }

  client = new Redis({ url, token });
  return client;
}