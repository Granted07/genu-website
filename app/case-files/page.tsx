"use client"

import { useCallback } from "react"

import { ArticleSectionLanding, type ArticleRecord } from "@/components/article-section-landing"
import { normalizeCategories } from "@/lib/utils"

const mapCaseFileRow = (row: any): ArticleRecord | null => {
  if (!row) return null
  return {
    uuid: row.uuid,
    title: row.title || "Untitled",
    summary: row.summary || "",
    categories: normalizeCategories(row.category) ?? []
  }
}

export default function CaseFilesPage() {
  const buildHref = useCallback((record: ArticleRecord) => `/case-files/${record.uuid}`, [])

  return (
    <ArticleSectionLanding
      apiPath="/api/casefiles"
      sectionLabel="Case Files"
      titleLines={["case", "files"]}
      tagline="evidence speaks louder"
      mapRow={mapCaseFileRow}
      hrefBuilder={buildHref}
      emptyMessage="No matching case files"
    />
  )
}
