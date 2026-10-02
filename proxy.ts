import { type NextRequest, NextResponse } from "next/server";
import {
  getClientIp,
  globalApiLimiter,
  rateLimitHeaders,
} from "@/lib/rate-limit";

/**
 * Broad, first-line rate limit across every /api/* route, on top of the
 * tighter per-route limiters (login attempts, uploads, etc.) applied inside
 * each route handler. This layer exists to catch abuse that hops between
 * endpoints rather than hammering just one.
 *
 * Runs on the Edge runtime, so it uses Upstash's REST-based Redis client
 * (works over fetch, no persistent TCP connection needed) with the same
 * in-memory fallback as the rest of lib/rate-limit.ts when Redis isn't
 * configured.
 */
export async function proxy(request: NextRequest) {
  const ip = getClientIp(request);
  const result = await globalApiLimiter.limit(ip);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(result) },
    );
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(rateLimitHeaders(result))) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
