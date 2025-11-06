import { createClient } from '@supabase/supabase-js'

import { ArticlePage } from '@/components/article-page'
import { normalizeCategories } from '@/lib/utils'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function CaseFilePage({ params }: { params: Promise<{ casefiles: string }> }) {
  const { casefiles: uuid } = await params
  try {
    const { data, error } = await supabase.from('casefiles').select('*').eq('uuid', uuid).single()
    if (error) return <div className="p-8">Not found</div>
    const row: any = data
    const title = row.title || 'Untitled'
    const dek = row.dek || row.subhead || row.summary || row.description || null
    const author = row.author || null
    const publishedAt = row.modified_at || row.created_at || null
    const content = row.content || ''
    const categories = normalizeCategories(row.category)

    return (
      <ArticlePage
        sectionLabel="Case Files"
        title={title}
        dek={dek}
        author={author}
        publishedAt={publishedAt}
        content={content}
        categories={categories}
      />
    )
  } catch (err) {
    return <div className="p-8">Error loading</div>
  }
}
