import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const buildPublicUrl = (path: string | null | undefined) => {
  if (!path) return null;
  const base = trimTrailingSlash(SUPABASE_URL || "");
  if (!base) return null;
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/hall_of_noise/${encodedPath}`;
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hall_of_noise")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data : [];
    const results = rows.map((row) => ({
      ...row,
      public_url: buildPublicUrl(row.file_path),
    }));

    return NextResponse.json({ data: results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
