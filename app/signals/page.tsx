import type { Metadata } from "next";
import ArticleSectionLanding, {
  type ArticleRecord,
} from "@/components/article-section-landing";
import CaseFilesLandingClient from "@/components/case-files-landing.client";
import { normalizeCategories } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Signals",
  description:
    "Brief, sharp updates on the ideas, events, and movements changing the world.",
  alternates: { canonical: "/signals" },
};

type SignalRow = {
  uuid?: string | null;
  title?: string | null;
  author?: string | null;
  summary?: string | null;
  category?: unknown;
};

const mapSignalsRow = (row: SignalRow | null): ArticleRecord | null => {
  if (!row) return null;
  return {
    uuid: row.uuid ?? "",
    title: row.title || row.author || "Untitled",
    summary: row.summary || "",
    categories: normalizeCategories(row.category) ?? [],
  };
};

export default function SignalsPage() {
  const buildHref = (record: ArticleRecord) => `/signals/${record.uuid}`;

  return (
    <ArticleSectionLanding
      apiPath="/api/signals"
      sectionLabel="Signals"
      titleLines={["signals"]}
      tagline="news bites that bite back"
      mapRow={mapSignalsRow}
      hrefBuilder={buildHref}
      pageSize={12}
      cardLabel="Signal Brief"
      ctaLabel="Read signal"
      emptyMessage="No matching signals"
      ClientComponent={CaseFilesLandingClient}
    />
  );
}
