import { createClient } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function DodArticlePage({ params }: { params: { id: string } }) {
  const uuid = params.id
  try {
    const { data, error } = await supabase.from('dod').select('*').eq('uuid', uuid).single()
    if (error) return <div className="p-8">Not found</div>
    const row: any = data
    return (
      <div className="max-w-4xl mx-auto p-8 mt-[72px]">
        <h1 className="text-4xl font-extrabold mb-4">{row.title || row.author || 'Untitled'}</h1>
        <div className="prose max-w-none">
          <ReactMarkdown>{row.content || ''}</ReactMarkdown>
        </div>
      </div>
    )
  } catch (err) {
    return <div className="p-8">Error loading</div>
  }
}
