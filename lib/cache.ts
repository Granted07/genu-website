import { logger } from "@/lib/logger";
import { getRedis } from "@/lib/redis";

/**
 * Small read-through cache for the public content endpoints
 * (/api/dod, /api/casefiles, /api/signals, /api/hall-of-noise).
 *
 * Backed by Upstash Redis when configured, so repeated reads across
 * different serverless instances/regions are actually deduped instead of
 * each cold instance re-querying Supabase. Falls back to a small in-memory
 * TTL cache (per warm instance) when Redis isn't configured, which still
 * helps under bursty traffic to a single warm function.
 */

type MemoryEntry = { value: unknown; expiresAt: number };
const memoryCache = new Map<string, MemoryEntry>();

function memoryGet<T>(key: string): T | undefined {
  const entry = memoryCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function memorySet(key: string, value: unknown, ttlSeconds: number) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  if (memoryCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of memoryCache) {
      if (v.expiresAt < now) memoryCache.delete(k);
    }
  }
}

/**
 * Returns the cached value for `key` if present, otherwise calls `loader`,
 * caches the result for `ttlSeconds`, and returns it.
 *
 * `loader` failures are never cached and propagate to the caller.
 */
export async function getOrSetJSON<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<{ value: T; hit: boolean }> {
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return { value: cached, hit: true };
      }
    } catch (err) {
      logger.warn("cache.redis_get_failed", {
        key,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    const cached = memoryGet<T>(key);
    if (cached !== undefined) return { value: cached, hit: true };
  }

  const value = await loader();

  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      logger.warn("cache.redis_set_failed", {
        key,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    memorySet(key, value, ttlSeconds);
  }

  return { value, hit: false };
}

/** Invalidate one or more cache keys — call after an admin write. */
export async function invalidate(...keys: string[]) {
  const redis = getRedis();
  for (const key of keys) memoryCache.delete(key);
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    logger.warn("cache.redis_invalidate_failed", {
      keys,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Cache key helper so routes/invalidation stay in sync. */
export function contentCacheKey(
  table: string,
  params?: Record<string, unknown>,
) {
  const suffix = params ? `:${JSON.stringify(params)}` : "";
  return `content:${table}${suffix}`;
}
