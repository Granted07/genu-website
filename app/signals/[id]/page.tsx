import { createClient } from '@supabase/supabase-js'

import { ArticlePage } from '@/components/article-page'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function SignalArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: uuid } = await params
  try {
    const { data, error } = await supabase.from('signals').select('*').eq('uuid', uuid).single()
    if (error) return <div className="p-8">Not found</div>
    const row: any = data
    const title = row.title || row.headline || row.author || 'Untitled'
    const dek = row.dek || row.subhead || row.summary || row.description || null
    const author = row.author || row.byline || null
    const publishedAt = row.published_at || row.created_at || null
    const content = row.content || ''

    return (
      <ArticlePage
        sectionLabel="Signals"
        title={title}
        dek={dek}
        author={author}
        publishedAt={publishedAt}
        content={content}
      />
    )
  } catch (err) {
    return <div className="p-8">Error loading</div>
  }
}
