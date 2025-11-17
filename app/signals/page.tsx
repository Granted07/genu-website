import ArticleSectionLanding, { type ArticleRecord } from "@/components/article-section-landing"
import { normalizeCategories } from "@/lib/utils"

const mapSignalsRow = (row: any): ArticleRecord | null => {
  if (!row) return null
  return {
    uuid: row.uuid,
    title: row.title || row.author || "Untitled",
    summary: row.summary || "",
    categories: normalizeCategories(row.category) ?? []
  }
}

export default function SignalsPage() {
  const buildHref = (record: ArticleRecord) => `/signals/${record.uuid}`

  return (
    <ArticleSectionLanding
      apiPath="/api/signals"
      sectionLabel="Signals"
      titleLines={["signals"]}
      tagline="news bites that bite back"
      mapRow={mapSignalsRow}
      hrefBuilder={buildHref}
      cardLabel="Signal Brief"
      ctaLabel="Read signal"
      emptyMessage="No matching signals"
    />
  )
}