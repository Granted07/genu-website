import ArticleSectionLanding, {
  type ArticleRecord,
} from "@/components/article-section-landing";
import CaseFilesLandingClient from "@/components/case-files-landing.client";
import { normalizeCategories } from "@/lib/utils";

const mapCaseFileRow = (row: any): ArticleRecord | null => {
  if (!row) return null;
  return {
    uuid: row.uuid,
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
      ctaLabel="Open dossier"
      emptyMessage="No matching case files"
      ClientComponent={CaseFilesLandingClient}
    />
  );
}
