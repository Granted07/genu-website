import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/jwt";
import { adminApiLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

type AuthSuccess = { ok: true };
type AuthFailure = { ok: false; response: NextResponse };

function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice("Bearer ".length).trim();
  }
  // Cookie fallback so the same guard works if a route is ever hit directly
  // by the browser (not just via fetch with an Authorization header).
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));
    if (match) return decodeURIComponent(match.split("=").slice(1).join("="));
  }
  return null;
}

/**
 * Verifies the caller holds a valid, unexpired admin JWT, and applies a
 * per-IP rate limit to authenticated admin endpoints (defense in depth on
 * top of the login-attempt limiter).
 *
 * Usage in a route handler:
 *   const auth = await requireAdminAuth(request);
 *   if (!auth.ok) return auth.response;
 */
export async function requireAdminAuth(
  request: Request,
): Promise<AuthSuccess | AuthFailure> {
  const ip = getClientIp(request);
  const limit = await adminApiLimiter.limit(ip);
  if (!limit.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateLimitHeaders(limit) },
      ),
    };
  }

  const token = extractToken(request);
  if (!token) {
    logger.warn("admin_auth.missing_token", { url: request.url });
    return {
      ok: false,
      response: NextResponse.json(
        { error: "unauthenticated" },
        { status: 401 },
      ),
    };
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    logger.warn("admin_auth.invalid_token", { url: request.url });
    return {
      ok: false,
      response: NextResponse.json(
        { error: "unauthenticated" },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}
