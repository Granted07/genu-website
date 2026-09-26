import { NextResponse } from "next/server";
import { buildStoragePublicUrl, getSupabasePublic } from "@/lib/supabase";
import { contentCacheKey, getOrSetJSON } from "@/lib/cache";
import { getClientIp, publicApiLimiter, rateLimitHeaders } from "@/lib/rate-limit";
import { isAbortError } from "@/lib/http";

export const revalidate = 60;

export async function GET(request: Request) {
  const limit = await publicApiLimiter.limit(getClientIp(request));
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  try {
    const { value } = await getOrSetJSON(
      contentCacheKey("hall_of_noise_public"),
      60,
      async () => {
        const { data, error } = await getSupabasePublic()
          .from("hall_of_noise")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
          .abortSignal(AbortSignal.timeout(8000));
        if (error) throw error;
        return (Array.isArray(data) ? data : []).map((row) => ({
          ...row,
          public_url: buildStoragePublicUrl("hall_of_noise", row.file_path),
        }));
      },
    );
    return NextResponse.json({ data: value }, { headers: rateLimitHeaders(limit) });
  } catch (err) {
    const timedOut = isAbortError(err);
    return NextResponse.json(
      { error: timedOut ? "Request timed out" : String(err) },
      {
        status: timedOut ? 504 : 500,
        headers: rateLimitHeaders(limit),
      },
    );
  }
}
