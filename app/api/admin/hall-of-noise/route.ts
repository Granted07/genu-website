import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getClientIp, rateLimitHeaders, uploadLimiter } from "@/lib/rate-limit";
import { buildStoragePublicUrl, getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "hall_of_noise";
const TABLE = "hall_of_noise";
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const VERBOSE =
  process.env.ADMIN_VERBOSE === "true" || process.env.NODE_ENV !== "production";

function log(
  level: "info" | "warn" | "error",
  message: string,
  meta?: unknown,
) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) {
    if (level === "error") console.error(base);
    else if (level === "warn") console.warn(base);
    else if (VERBOSE) console.log(base);
    return;
  }

  let payload: unknown = meta;
  try {
    payload =
      typeof meta === "string" ? meta : JSON.parse(JSON.stringify(meta));
  } catch {
    payload = meta;
  }

  if (level === "error") console.error(base, payload);
  else if (level === "warn") console.warn(base, payload);
  else if (VERBOSE) console.log(base, payload);
}

const supabase = getSupabaseAdmin();

async function checkAuth(request: Request) {
  return (await requireAdminAuth(request)).ok;
}

const buildPublicUrl = (path: string | null | undefined) => {
  return buildStoragePublicUrl(BUCKET, path);
};

const sanitizeFilename = (name: string) => {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe || `audio-${Date.now()}`;
};

const mapRowWithUrl = (row: Record<string, unknown>) => {
  const record = row as Record<string, unknown>;
  const publicUrl =
    typeof record.public_url === "string"
      ? record.public_url
      : buildPublicUrl(
          typeof record.file_path === "string"
            ? record.file_path
            : typeof record.path === "string"
              ? record.path
              : null,
        );

  return {
    ...record,
    public_url: publicUrl,
  };
};

export async function GET(request: Request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const details =
        typeof error === "object" && error !== null && "details" in error
          ? error.details
          : undefined;
      log("error", "Hall of Noise list error", {
        message: error.message,
        details,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data.map(mapRowWithUrl) : [];
    return NextResponse.json({ data: rows });
  } catch (err) {
    log(
      "error",
      "Hall of Noise list unexpected",
      err instanceof Error ? { message: err.message, stack: err.stack } : err,
    );
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const limit = await uploadLimiter.limit(getClientIp(request));
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many uploads" },
        { status: 429, headers: rateLimitHeaders(limit) },
      );
    }
    const formData = await request.formData();
    const title = (formData.get("title") ?? "").toString().trim() || null;
    const author = (formData.get("author") ?? "").toString().trim() || null;
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Audio file missing" },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Audio file must be between 1 byte and 50 MB" },
        { status: 413 },
      );
    }

    const originalName = file.name || "audio-upload";
    const safeName = sanitizeFilename(originalName);
    const filePath = `uploads/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (upload.error) {
      log("error", "Hall of Noise upload failure", {
        message: upload.error.message,
      });
      return NextResponse.json(
        { error: upload.error.message },
        { status: 500 },
      );
    }

    const insert = await supabase
      .from(TABLE)
      .insert({
        title,
        author,
        file_path: filePath,
        file_name: originalName,
        mime_type: file.type || null,
        file_size: typeof file.size === "number" ? file.size : null,
      })
      .select()
      .single();

    if (insert.error) {
      log("error", "Hall of Noise metadata insert failure", {
        message: insert.error.message,
      });
      await supabase.storage
        .from(BUCKET)
        .remove([filePath])
        .catch(() => undefined);
      return NextResponse.json(
        { error: insert.error.message },
        { status: 500 },
      );
    }

    const rowWithUrl = mapRowWithUrl(insert.data as Record<string, unknown>);
    return NextResponse.json(
      { row: rowWithUrl, publicUrl: rowWithUrl.public_url },
      { status: 201 },
    );
  } catch (err) {
    log(
      "error",
      "Hall of Noise upload unexpected",
      err instanceof Error ? { message: err.message, stack: err.stack } : err,
    );
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const uuid = url.searchParams.get("uuid");
    const id = url.searchParams.get("id");
    const filePathParam = url.searchParams.get("file_path");

    if (!uuid && !id) {
      return NextResponse.json(
        { error: "missing identifier" },
        { status: 400 },
      );
    }

    const match: Record<string, string> = {};
    if (uuid) match.uuid = uuid;
    if (id) match.id = id;

    const existing = await supabase
      .from(TABLE)
      .select("*")
      .match(match)
      .maybeSingle();

    if (existing.error) {
      log("error", "Hall of Noise fetch before delete failed", {
        message: existing.error.message,
      });
      return NextResponse.json(
        { error: existing.error.message },
        { status: 500 },
      );
    }

    const filePath = existing.data?.file_path || filePathParam;
    const removal = await supabase.from(TABLE).delete().match(match);
    if (removal.error) {
      log("error", "Hall of Noise delete metadata failed", {
        message: removal.error.message,
      });
      return NextResponse.json(
        { error: removal.error.message },
        { status: 500 },
      );
    }

    if (filePath) {
      await supabase.storage
        .from(BUCKET)
        .remove([filePath])
        .catch((error) => {
          log("warn", "Hall of Noise storage delete issue", {
            message: error?.message || String(error),
          });
        });
    }

    const { data: refreshed } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    const rows = Array.isArray(refreshed) ? refreshed.map(mapRowWithUrl) : [];
    return NextResponse.json({ data: rows });
  } catch (err) {
    log(
      "error",
      "Hall of Noise delete unexpected",
      err instanceof Error ? { message: err.message, stack: err.stack } : err,
    );
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
