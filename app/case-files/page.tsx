import type { Metadata } from "next";
import ArticleSectionLanding, {
  type ArticleRecord,
} from "@/components/article-section-landing";
import CaseFilesLandingClient from "@/components/case-files-landing.client";
import { normalizeCategories } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Case Files",
  description:
    "Investigations and documented evidence from the people and places shaping our future.",
  alternates: { canonical: "/case-files" },
};

type CaseFileRow = {
  uuid?: string | null;
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  category?: unknown;
};

const mapCaseFileRow = (row: CaseFileRow | null): ArticleRecord | null => {
  if (!row) return null;
  return {
    uuid: row.uuid ?? "",
    title: row.title || "Untitled",
    summary: row.summary || row.content || "",
    categories: normalizeCategories(row.category) ?? [],
  };
};

export default function CaseFilesPage() {
  const buildHref = (record: ArticleRecord) => `/case-files/${record.uuid}`;

  return (
    <ArticleSectionLanding
      apiPath="/api/casefiles"
      sectionLabel="Case Files"
      titleLines={["case", "files"]}
      tagline="evidence speaks louder"
      mapRow={mapCaseFileRow}
      hrefBuilder={buildHref}
      pageSize={12}
      cardLabel="Field Dossier"
      emptyMessage="No matching case files"
      ClientComponent={CaseFilesLandingClient}
    />
  );
}
