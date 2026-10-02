import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

let adminClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

/**
 * Service-role client — bypasses RLS. Only ever use this on the server, for
 * admin routes or trusted server-rendered reads. Never expose this key to
 * the browser.
 *
 * Unlike the previous per-route setup, this does NOT silently fall back to
 * the anon key when the service-role key is missing: an admin route running
 * with anon permissions would fail writes in a confusing way (RLS silently
 * rejecting inserts/updates), so we fail loudly in the logs instead.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    logger.error(
      "supabase.admin_client_misconfigured",
      new Error("Missing Supabase URL or service role key"),
      {
        hasUrl: Boolean(SUPABASE_URL),
        hasServiceRoleKey: Boolean(SERVICE_ROLE_KEY),
      },
    );
  }

  adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || ANON_KEY, {
    auth: { persistSession: false },
  });
  return adminClient;
}

/** Anon-key client for public, RLS-protected reads. */
export function getSupabasePublic(): SupabaseClient {
  if (publicClient) return publicClient;

  if (!SUPABASE_URL || !ANON_KEY) {
    logger.error(
      "supabase.public_client_misconfigured",
      new Error("Missing Supabase URL or anon key"),
      { hasUrl: Boolean(SUPABASE_URL), hasAnonKey: Boolean(ANON_KEY) },
    );
  }

  publicClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  });
  return publicClient;
}

export function buildStoragePublicUrl(
  bucket: string,
  path: string | null | undefined,
): string | null {
  if (!path || !SUPABASE_URL) return null;
  const base = SUPABASE_URL.replace(/\/$/, "");
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
