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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function contentUrls(
  table: "casefiles" | "dod" | "signals",
  prefix: string,
) {
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
        url: absoluteUrl(`${prefix}/${encodeURIComponent(row.uuid)}`),
        lastModified:
          row.modified_at ?? row.published_at ?? row.created_at ?? null,
      }));
  } catch {
    return [];
  }
}

export async function GET() {
  const [caseFiles, daughters, signals] = await Promise.all([
    contentUrls("casefiles", "/case-files"),
    contentUrls("dod", "/daughters-of-dissent"),
    contentUrls("signals", "/signals"),
  ]);

  const entries = [
    ...publicRoutes.map((pathname) => ({
      url: absoluteUrl(pathname),
      lastModified: null,
    })),
    ...caseFiles,
    ...daughters,
    ...signals,
  ];

  const urls = entries
    .map(
      ({ url, lastModified }) =>
        `  <url><loc>${escapeXml(url)}</loc>${
          lastModified
            ? `<lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>`
            : ""
        }</url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
