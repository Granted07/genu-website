import { NextResponse } from "next/server";
import { fetchContentPreview, parsePreviewParams } from "@/lib/content-preview";
import { getClientIp, publicApiLimiter, rateLimitHeaders } from "@/lib/rate-limit";
import { isAbortError } from "@/lib/http";

export async function GET(request: Request) {
  const limit = await publicApiLimiter.limit(getClientIp(request));
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(limit) });
  }

  try {
    const result = await fetchContentPreview("get_signals_preview", "signals", parsePreviewParams(new URL(request.url)));
    return NextResponse.json(result, { headers: rateLimitHeaders(limit) });
  } catch (err) {
    return NextResponse.json({ error: isAbortError(err) ? "Request timed out" : String(err) }, { status: isAbortError(err) ? 504 : 500, headers: rateLimitHeaders(limit) });
  }
}
