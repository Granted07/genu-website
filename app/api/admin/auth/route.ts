import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { getClientIp, loginLimiter, rateLimitHeaders } from "@/lib/rate-limit";

const ADMIN_PASS_HASH =
  process.env.ADMIN_PASS_HASH ||
  "$2a$12$yuffQz/98t4Uu9m5FtMV8udrz/LQg7KCkec/f9wfvzDgnsfGYhhXO";

export async function POST(request: Request) {
  try {
    const limit = await loginLimiter.limit(getClientIp(request));
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: rateLimitHeaders(limit) },
      );
    }

    const { password } = await request.json();
    const hash = ADMIN_PASS_HASH;
    if (!hash) {
      logger.error("admin_auth.password_not_configured");
      return NextResponse.json(
        { ok: false, error: "No admin password configured" },
        { status: 500 },
      );
    }

    const match = await bcrypt.compare(password, hash);
    if (match) {
      const token = signAdminToken();
      const response = NextResponse.json({ ok: true, token });
      response.cookies.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 12,
        path: "/",
      });
      logger.info("admin_auth.success");
      return response;
    }
    logger.warn("admin_auth.invalid_password");
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (err) {
    logger.error("admin_auth.unexpected_error", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
