import type { Metadata } from "next";
import ArticleSectionLanding, {
  type ArticleRecord,
} from "@/components/article-section-landing";
import CaseFilesLandingClient from "@/components/case-files-landing.client";
import { normalizeCategories } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Daughters of Dissent",
  description:
    "Stories of women challenging power, changing culture, and building what comes next.",
  alternates: { canonical: "/daughters-of-dissent" },
};

type DodRow = {
  uuid?: string | null;
  title?: string | null;
  author?: string | null;
  summary?: string | null;
  category?: unknown;
};

const mapDodRow = (row: DodRow | null): ArticleRecord | null => {
  if (!row) return null;
  return {
    uuid: row.uuid ?? "",
    title: row.title || row.author || "Untitled",
    summary: row.summary || "",
    categories: normalizeCategories(row.category) ?? [],
  };
};

export default function DaughtersOfDissentPage() {
  const buildHref = (record: ArticleRecord) =>
    `/daughters-of-dissent/${record.uuid}`;

  return (
    <ArticleSectionLanding
      apiPath="/api/dod"
      sectionLabel="Daughters of Dissent"
      titleLines={["daughters", "of dissent"]}
      tagline="rebellion looks like her"
      mapRow={mapDodRow}
      hrefBuilder={buildHref}
      pageSize={12}
      cardLabel="Field Report"
      ctaLabel="Read story"
      emptyMessage="No matching stories"
      ClientComponent={CaseFilesLandingClient}
    />
  );
}
