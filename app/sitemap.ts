import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getSupabasePublic } from "@/lib/supabase";

const publicRoutes = [
  "/",
  "/case-files",
  "/daughters-of-dissent",
  "/signals",
  "/hall-of-noise",
  "/team",
  "/sponsors",
] as const;

type ContentRow = {
  uuid?: string | null;
  modified_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

async function contentUrls(
  table: "casefiles" | "dod" | "signals",
  prefix: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    const { data } = await getSupabasePublic()
      .from(table)
      .select("uuid, modified_at, published_at, created_at")
      .limit(1000);

    return (Array.isArray(data) ? data : [])
      .map((row) => row as ContentRow)
      .filter(
        (row): row is ContentRow & { uuid: string } =>
          typeof row.uuid === "string" && row.uuid.length > 0,
      )
      .map((row) => ({
        url: absoluteUrl(`${prefix}/${row.uuid}`),
        lastModified:
          row.modified_at ?? row.published_at ?? row.created_at ?? undefined,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = publicRoutes.map((pathname) => ({
    url: absoluteUrl(pathname),
  }));
  const [caseFiles, daughters, signals] = await Promise.all([
    contentUrls("casefiles", "/case-files"),
    contentUrls("dod", "/daughters-of-dissent"),
    contentUrls("signals", "/signals"),
  ]);

  return [...staticEntries, ...caseFiles, ...daughters, ...signals];
}
