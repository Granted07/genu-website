import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { logger } from "@/lib/logger";

/**
 * Secure admin session tokens.
 *
 * Replaces the previous scheme (raw admin password sent as a Bearer token
 * on every request, re-verified with bcrypt each time). Now:
 *  - the password is checked once, at login
 *  - a short-lived signed JWT is issued
 *  - every subsequent request verifies a fast HMAC signature instead of
 *    re-hashing a password
 *
 * Set ADMIN_JWT_SECRET in production (see .env.example). If it's missing we
 * generate a random secret at boot so local dev still works — but that
 * means every server restart invalidates existing sessions, which is why
 * this is NOT safe for production (multiple instances would each mint
 * tokens the others can't verify).
 */

const FALLBACK_SECRET = crypto.randomBytes(32).toString("hex");

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === "production") {
    logger.error(
      "jwt.missing_secret",
      new Error("ADMIN_JWT_SECRET is not set"),
      {
        hint: "Set ADMIN_JWT_SECRET to a long random string in your production environment. Falling back to an ephemeral per-instance secret, which will invalidate sessions unpredictably.",
      },
    );
  }
  return FALLBACK_SECRET;
}

const ISSUER = "genu-website-admin";
const EXPIRES_IN = "12h";

export type AdminTokenPayload = {
  role: "admin";
};

export function signAdminToken(): string {
  const payload: AdminTokenPayload = { role: "admin" };
  return jwt.sign(payload, getSecret(), {
    issuer: ISSUER,
    expiresIn: EXPIRES_IN,
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(), { issuer: ISSUER });
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      (decoded as AdminTokenPayload).role === "admin"
    ) {
      return decoded as AdminTokenPayload;
    }
    return null;
  } catch (err) {
    // Expired / malformed / bad signature — all treated as "not authed".
    if (!(err instanceof jwt.TokenExpiredError)) {
      logger.debug("jwt.verify_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return null;
  }
}

export const ADMIN_COOKIE_NAME = "admin_session";
