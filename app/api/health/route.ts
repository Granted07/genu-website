import { NextResponse } from "next/server";
import { isAbortError } from "@/lib/http";
import { logger } from "@/lib/logger";
import { getSupabasePublic } from "@/lib/supabase";

export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  try {
    const { error } = await getSupabasePublic()
      .from("dod")
      .select("uuid", { head: true, count: "exact" })
      .limit(1)
      .abortSignal(AbortSignal.timeout(5000));

    if (error) throw error;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      checks: { database: "ok" },
    });
  } catch (error) {
    logger.error("health.db_check_failed", error);
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        checks: {
          database: "error",
          databaseError: isAbortError(error)
            ? "database check timed out"
            : error instanceof Error
              ? error.message
              : String(error),
        },
      },
      { status: 503 },
    );
  }
}
