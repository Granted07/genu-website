"use client"

import { useCallback } from "react"

import { ArticleSectionLanding, type ArticleRecord } from "@/components/article-section-landing"
import { normalizeCategories } from "@/lib/utils"

const mapDodRow = (row: any): ArticleRecord | null => {
  if (!row) return null
  return {
    uuid: row.uuid,
    title: row.title || row.author || "Untitled",
    summary: row.summary || "",
    categories: normalizeCategories(row.category) ?? []
  }
}

export default function DaughtersOfDissentPage() {
  const buildHref = useCallback((record: ArticleRecord) => `/daughters-of-dissent/${record.uuid}`, [])

  return (
    <ArticleSectionLanding
      apiPath="/api/dod"
      sectionLabel="Daughters of Dissent"
      titleLines={["daughters", "of dissent"]}
      tagline="rebellion looks like her"
      mapRow={mapDodRow}
      hrefBuilder={buildHref}
      cardLabel="Field Report"
      ctaLabel="Read story"
      emptyMessage="No matching stories"
    />
  )
}
