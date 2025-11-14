import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = "hall_of_noise";
const TABLE = "hall_of_noise";
const VERBOSE = process.env.ADMIN_VERBOSE === "true" || process.env.NODE_ENV !== "production";

function log(level: "info" | "warn" | "error", message: string, meta?: unknown) {
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
    payload = typeof meta === "string" ? meta : JSON.parse(JSON.stringify(meta));
  } catch {
    payload = meta;
  }

  if (level === "error") console.error(base, payload);
  else if (level === "warn") console.warn(base, payload);
  else if (VERBOSE) console.log(base, payload);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log("warn", "Supabase credentials missing for Hall of Noise upload endpoint", {
    hasUrl: Boolean(SUPABASE_URL),
    hasKey: Boolean(SUPABASE_KEY)
  });
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

const PASSWORD_HASH = "$2a$12$Phl7cW3wqDDLRtVvsaRuo.fxCNvfE0Hk8cK4tYPyK6ba/yL91wdge";

async function checkAuth(request: Request) {
  try {
    const header = request.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      log("warn", "Hall of Noise upload unauthorized: missing bearer header");
      return false;
    }
    const token = header.slice("Bearer ".length);
    const valid = await bcrypt.compare(token, PASSWORD_HASH);
    log("info", "Hall of Noise upload auth", { success: valid });
    return valid;
  } catch (err) {
    log("error", "Hall of Noise auth error", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return false;
  }
}

const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");
const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

const buildPublicUrl = (path: string | null | undefined) => {
  if (!path || !SUPABASE_URL) return null;
  return `${trimTrailingSlash(SUPABASE_URL)}/storage/v1/object/public/${BUCKET}/${encodePath(path)}`;
};

const sanitizeFilename = (name: string) => {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe || `audio-${Date.now()}`;
};

const mapRowWithUrl = (row: Record<string, any>) => ({
  ...row,
  public_url: row?.public_url ?? buildPublicUrl(row?.file_path ?? row?.path ?? null)
});

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
      log("error", "Hall of Noise list error", { message: error.message, details: (error as any).details });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data.map(mapRowWithUrl) : [];
    return NextResponse.json({ data: rows });
  } catch (err) {
    log("error", "Hall of Noise list unexpected", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = (formData.get("title") ?? "").toString().trim() || null;
    const author = (formData.get("author") ?? "").toString().trim() || null;
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Audio file missing" }, { status: 400 });
    }

    const originalName = file.name || "audio-upload";
    const safeName = sanitizeFilename(originalName);
    const filePath = `uploads/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined
    });

    if (upload.error) {
      log("error", "Hall of Noise upload failure", { message: upload.error.message });
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const insert = await supabase
      .from(TABLE)
      .insert({
        title,
        author,
        file_path: filePath,
        file_name: originalName,
        mime_type: file.type || null,
        file_size: typeof file.size === "number" ? file.size : null
      })
      .select()
      .single();

    if (insert.error) {
      log("error", "Hall of Noise metadata insert failure", { message: insert.error.message });
      await supabase.storage.from(BUCKET).remove([filePath]).catch(() => undefined);
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    const rowWithUrl = mapRowWithUrl(insert.data as Record<string, any>);
    return NextResponse.json({ row: rowWithUrl, publicUrl: rowWithUrl.public_url }, { status: 201 });
  } catch (err) {
    log("error", "Hall of Noise upload unexpected", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "missing identifier" }, { status: 400 });
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
      log("error", "Hall of Noise fetch before delete failed", { message: existing.error.message });
      return NextResponse.json({ error: existing.error.message }, { status: 500 });
    }

    const filePath = existing.data?.file_path || filePathParam;
    const removal = await supabase.from(TABLE).delete().match(match);
    if (removal.error) {
      log("error", "Hall of Noise delete metadata failed", { message: removal.error.message });
      return NextResponse.json({ error: removal.error.message }, { status: 500 });
    }

    if (filePath) {
      await supabase.storage.from(BUCKET).remove([filePath]).catch((error) => {
        log("warn", "Hall of Noise storage delete issue", { message: error?.message || String(error) });
      });
    }

    const { data: refreshed } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    const rows = Array.isArray(refreshed) ? refreshed.map(mapRowWithUrl) : [];
    return NextResponse.json({ data: rows });
  } catch (err) {
    log("error", "Hall of Noise delete unexpected", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
