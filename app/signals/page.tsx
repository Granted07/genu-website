"use client"

import { useCallback } from "react"

import { ArticleSectionLanding, type ArticleRecord } from "@/components/article-section-landing"
import { normalizeCategories } from "@/lib/utils"

const mapSignalsRow = (row: any): ArticleRecord | null => {
  if (!row) return null
  return {
    uuid: row.uuid,
    title: row.title || row.author || "Untitled",
    content: row.content || "",
    categories: normalizeCategories(row.category) ?? []
  }
}

export default function SignalsPage() {
  const buildHref = useCallback((record: ArticleRecord) => `/signals/${record.uuid}`, [])

  return (
    <ArticleSectionLanding
      apiPath="/api/signals"
      sectionLabel="Signals"
      titleLines={["signals"]}
      tagline="news bite that bite back"
      mapRow={mapSignalsRow}
      hrefBuilder={buildHref}
      cardLabel="Signal Brief"
      ctaLabel="Read signal"
      emptyMessage="No matching signals"
    />
  )
}