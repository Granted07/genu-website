import { getSiteUrl } from "@/lib/site";
import { getSupabasePublic } from "@/lib/supabase";

type FeedRow = {
  uuid?: string | null;
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  created_at?: string | null;
  modified_at?: string | null;
};

type FeedEntry = FeedRow & { prefix: string };

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl().toString().replace(/\/$/, "");
  const sources = await Promise.all(
    (
      [
        ["casefiles", "/case-files"],
        ["dod", "/daughters-of-dissent"],
        ["signals", "/signals"],
      ] as const
    ).map(async ([table, prefix]) => {
      const { data } = await getSupabasePublic()
        .from(table)
        .select("uuid, title, summary, content, created_at, modified_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return (Array.isArray(data) ? data : []).map(
        (row): FeedEntry => ({
          ...(row as FeedRow),
          prefix,
        }),
      );
    }),
  );

  const items = sources
    .flat()
    .filter(
      (row): row is FeedEntry & { uuid: string } =>
        typeof row.uuid === "string" && row.uuid.length > 0,
    )
    .map((row) => {
      const link = `${siteUrl}${row.prefix}/${encodeURIComponent(row.uuid)}`;
      const title = row.title ?? "Untitled";
      const description = row.summary ?? row.content ?? "";
      const date =
        row.modified_at ?? row.created_at ?? new Date().toISOString();
      return `<item><title>${escapeXml(title)}</title><link>${escapeXml(link)}</link><guid isPermaLink="true">${escapeXml(link)}</guid><description>${escapeXml(description)}</description><pubDate>${new Date(date).toUTCString()}</pubDate></item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml("Gen Uprising")}</title><link>${escapeXml(siteUrl)}</link><description>${escapeXml("Gen Uprising editorial archive")}</description>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
