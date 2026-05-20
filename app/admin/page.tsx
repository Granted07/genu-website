"use client"
import React from 'react'
import { Manrope, Playfair_Display } from 'next/font/google'
import { Button } from '@/components/ui/button'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '600', '700'] })

type Row = {
  uuid: string;
  created_at: string;
  modified_at?: string | null;
  title?: string | null;
  author: string;
  category?: any;
  content: string;
  reading_time?: string | null;
}

type HallRow = {
  id?: string | number;
  uuid?: string;
  created_at?: string | null;
  title?: string | null;
  author?: string | null;
  file_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  public_url?: string | null;
}

export default function AdminPage() {
  const [password, setPassword] = React.useState('')
  const [status, setStatus] = React.useState<'idle'|'loading'|'ok'|'error'>('idle')
  const [token, setToken] = React.useState('')
  const [table, setTable] = React.useState<'dod'|'casefiles'|'signals'|'hall'>('dod')
  const [rows, setRows] = React.useState<Row[]>([])
  const [editing, setEditing] = React.useState<Record<string, Partial<Row>>>({})
  const [hallRows, setHallRows] = React.useState<HallRow[]>([])
  const [hallForm, setHallForm] = React.useState<{ title: string; author: string; file: File | null }>({ title: '', author: '', file: null })
  const [hallStatus, setHallStatus] = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [hallMessage, setHallMessage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300/60 focus:outline-none'
  const contentInputClass = 'min-h-[180px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white placeholder:text-white/40 focus:border-amber-300/60 focus:outline-none'
  const tableLabel: Record<typeof table, string> = {
    dod: 'Daughters of Dissent',
    casefiles: 'Case Files',
    signals: 'Signals',
    hall: 'Hall of Noise'
  }
  const activeLabel = tableLabel[table]
  const activeCount = table === 'hall' ? hallRows.length : rows.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (res.ok) {
        setStatus('ok')
        setToken(password)
        fetchTable(table, password)
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  async function fetchTable(t: typeof table, tokenValue?: string) {
    const auth = tokenValue || token
    if (!auth) return

    if (t === 'hall') {
      const res = await fetch('/api/admin/hall-of-noise', {
        headers: { Authorization: `Bearer ${auth}` }
      })
      if (res.ok) {
        const json = await res.json()
        setHallRows(json.data || [])
      }
      return
    }

    const res = await fetch(`/api/admin/data?table=${t}`, {
      headers: { Authorization: `Bearer ${auth}` }
    })
    if (res.ok) {
      const json = await res.json()
      setRows(json.data || [])
    }
  }

  // convert category input string (possibly quoted, comma separated) into array
  const parseCategoryInput = (val: any) => {
    if (val == null) return null
    if (Array.isArray(val)) return val.map(String)
    if (typeof val !== 'string') return val
    const trimmed = val.trim()
    if (!trimmed) return null
    // try parse JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try { const parsed = JSON.parse(trimmed); return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]; } catch { /* fallthrough */ }
    }
    // split on commas, remove surrounding quotes and whitespace
    return trimmed.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
  }

  const formatBytes = (value?: number | null) => {
    if (!value || Number.isNaN(value)) return '—'
    if (value < 1024) return `${value} B`
    const units = ['KB', 'MB', 'GB']
    let size = value / 1024
    let unit = 0
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024
      unit += 1
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`
  }

  const resolveHallId = (row: HallRow) => {
    if (row.uuid) return row.uuid
    if (row.id != null) return String(row.id)
    return row.file_path ?? 'unknown'
  }

  async function saveRow(uuid?: string) {
    if (table === 'hall') return
    const edit = editing[uuid || 'new']
    if (!edit) return
    const rowToSend: any = { ...edit }
    rowToSend.category = parseCategoryInput(edit.category)
    const method = uuid ? 'PUT' : 'POST'
    const url = uuid ? '/api/admin/data' : '/api/admin/data'
    const body = uuid ? { table, uuid, row: rowToSend } : { table, row: rowToSend }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      await fetchTable(table)
      setEditing(prev => { const copy = { ...prev }; delete copy[uuid || 'new']; return copy })
    }
  }

  async function deleteRow(uuid: string) {
    if (table === 'hall') return
    const res = await fetch(`/api/admin/data?table=${table}&uuid=${uuid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) fetchTable(table)
  }

  async function handleHallUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      setHallStatus('error')
      setHallMessage('Authenticate before uploading.')
      return
    }
    if (!hallForm.file) {
      setHallStatus('error')
      setHallMessage('Select an audio file before uploading.')
      return
    }

    setHallStatus('loading')
    setHallMessage(null)

    try {
      const formData = new FormData()
      formData.append('title', hallForm.title.trim())
      formData.append('author', hallForm.author.trim())
      formData.append('file', hallForm.file)

      const res = await fetch('/api/admin/hall-of-noise', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setHallStatus('error')
        setHallMessage(json?.error || 'Upload failed')
        return
      }

      setHallStatus('ok')
      setHallMessage('Upload complete')
      setHallForm({ title: '', author: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchTable('hall')
    } catch (err) {
      setHallStatus('error')
      setHallMessage(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleHallDelete(row: HallRow) {
    if (!token) return
    const params = new URLSearchParams()
    if (row.uuid) params.append('uuid', row.uuid)
    if (row.id != null) params.append('id', String(row.id))
    if (row.file_path) params.append('file_path', row.file_path)
    const query = params.toString()
    const res = await fetch(`/api/admin/hall-of-noise${query ? `?${query}` : ''}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const json = await res.json().catch(() => null)
      if (json?.data) setHallRows(json.data)
      else await fetchTable('hall')
    }
  }

  React.useEffect(() => {
    if (status === 'ok') fetchTable(table)
  }, [table, status])

  return (
    <div className={`${manrope.className} min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_rgba(3,7,18,0.94)_55%)] text-white pt-[110px]`}>
      {status !== 'ok' ? (
          <div className="mx-auto mt-20 flex w-full max-w-lg flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.55)] ">
            <div className="space-y-4">
              <p className="text-[0.7rem] uppercase tracking-[0.5em] text-white/50">Admin Console</p>
              <h1 className={`${playfair.className} text-3xl font-semibold`}>Access control</h1>
              <p className="text-sm text-white/65">Authenticate to manage entries, uploads, and publication content.</p>
            </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <Button type="submit" className="w-full tracking-widest bg-white py-5 hover:bg-gray-500 rounded-3xl mt-10">LOGIN</Button>
                {status === 'error' && <div className="text-sm text-red-300">Invalid password</div>}
              </form>
          
          </div>
      ) : (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.5em] text-white/50">Admin Console</p>
              <h1 className={`${playfair.className} text-3xl font-semibold`}>Publishing control</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/50">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/70">
                  Active: {activeLabel}
                </span>
                <span>{activeCount} entries</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTable('dod')}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === 'dod' ? 'border-amber-300 bg-amber-300/20 text-white' : 'border-white/15 text-white/60 hover:border-white/40'}`}
              >
                DOD
              </button>
              <button
                type="button"
                onClick={() => setTable('casefiles')}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === 'casefiles' ? 'border-amber-300 bg-amber-300/20 text-white' : 'border-white/15 text-white/60 hover:border-white/40'}`}
              >
                Case Files
              </button>
              <button
                type="button"
                onClick={() => setTable('signals')}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === 'signals' ? 'border-amber-300 bg-amber-300/20 text-white' : 'border-white/15 text-white/60 hover:border-white/40'}`}
              >
                Signals
              </button>
              <button
                type="button"
                onClick={() => setTable('hall')}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === 'hall' ? 'border-amber-300 bg-amber-300/20 text-white' : 'border-white/15 text-white/60 hover:border-white/40'}`}
              >
                Hall of Noise
              </button>
              {table !== 'hall' && (
                <Button onClick={() => setEditing(prev => ({ ...prev, new: { author: '', content: '', category: '' } }))}>Add New</Button>
              )}
            </div>
          </div>

          {table === 'hall' ? (
            <div className="space-y-8">
              <form onSubmit={handleHallUpload} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.4em] text-white/60">Title</label>
                  <input
                    className={inputClass}
                    value={hallForm.title}
                    onChange={(e) => setHallForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Newsletter title"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.4em] text-white/60">Author</label>
                  <input
                    className={inputClass}
                    value={hallForm.author}
                    onChange={(e) => setHallForm(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Producer / host"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.4em] text-white/60">Audio file</label>
                  <input
                    ref={fileInputRef}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                    type="file"
                    accept="audio/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0] ?? null
                      setHallForm(prev => ({ ...prev, file }))
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={hallStatus === 'loading'}>
                    {hallStatus === 'loading' ? 'Uploading…' : 'Upload audio'}
                  </Button>
                  {hallMessage && (
                    <span className={`text-sm ${hallStatus === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                      {hallMessage}
                    </span>
                  )}
                  {hallStatus === 'loading' && (
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">Processing</span>
                  )}
                </div>
              </form>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.4em] text-white/50">
                      <th className="text-left">Title</th>
                      <th className="text-left">Author</th>
                      <th className="text-left">File</th>
                      <th className="text-left">Uploaded</th>
                      <th className="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hallRows.map((row) => {
                      const key = resolveHallId(row)
                      const link = row.public_url || (row.file_path ? `/storage/${row.file_path}` : null)
                      return (
                        <tr key={key} className="border-t border-white/10">
                          <td>{row.title ?? 'Untitled'}</td>
                          <td>{row.author ?? '—'}</td>
                          <td className="space-y-1">
                            <div className="text-sm text-white/90">{row.file_name ?? row.file_path ?? 'Unknown file'}</div>
                            <div className="text-xs text-white/50">
                              {formatBytes(row.file_size)}{row.mime_type ? ` • ${row.mime_type}` : ''}
                            </div>
                            {link && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-amber-200 underline"
                              >
                                Open file
                              </a>
                            )}
                          </td>
                          <td className="text-sm text-white/60">
                            {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                          </td>
                          <td>
                            <Button variant="destructive" onClick={() => handleHallDelete(row)}>Delete</Button>
                          </td>
                        </tr>
                      )
                    })}
                    {hallRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-sm text-white/50">
                          No uploads yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.4em] text-white/50">
                    <th className="text-left">Title</th>
                    <th className="text-left">Author</th>
                    <th className="text-left">Content</th>
                    <th className="text-left">Category</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(editing).map(([key, val]) => key === 'new' ? (
                    <tr key={key} className="border-t border-white/10 bg-white/5">
                      <td><input className={inputClass} value={val.title || ''} onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], title: e.target.value } }))} /></td>
                      <td><input className={inputClass} value={val.author || ''} onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], author: e.target.value } }))} /></td>
                      <td>
                        <textarea
                          className={contentInputClass}
                          value={val.content || ''}
                          onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], content: e.target.value } }))}
                        />
                      </td>
                      <td><input className={inputClass} value={val.category || ''} onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], category: e.target.value } }))} /></td>
                      <td><Button onClick={() => saveRow(undefined)}>Save</Button></td>
                    </tr>
                  ) : null)}

                {rows.map(row => (
                  <tr key={row.uuid} className="border-t border-white/10">
                    <td>
                      {editing[row.uuid] ? (
                        <input className={inputClass} value={editing[row.uuid].title ?? row.title ?? ''} onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], title: e.target.value } }))} />
                      ) : <div className="font-semibold">{row.title}</div>}
                    </td>
                    <td>
                      {editing[row.uuid] ? (
                        <input className={inputClass} value={editing[row.uuid].author || row.author} onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], author: e.target.value } }))} />
                      ) : row.author}
                    </td>
                    <td>
                      {editing[row.uuid] ? (
                        <textarea
                          className={contentInputClass}
                          value={editing[row.uuid].content || row.content}
                          onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], content: e.target.value } }))}
                        />
                      ) : <div className="line-clamp-3">{row.content}</div>}
                    </td>
                    <td>
                      {editing[row.uuid] ? (
                        <input
                          className={inputClass}
                          value={editing[row.uuid].category ?? (Array.isArray(row.category) ? row.category.join(', ') : (typeof row.category === 'string' ? row.category : ''))}
                          onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], category: e.target.value } }))}
                        />
                      ) : <div className="text-sm text-white/70">{Array.isArray(row.category) ? row.category.join(', ') : String(row.category)}</div>}
                    </td>
                    <td className="flex gap-2">
                      {editing[row.uuid] ? (
                        <>
                          <Button onClick={() => saveRow(row.uuid)}>Save</Button>
                          <Button variant="secondary" onClick={() => setEditing(prev => { const copy = { ...prev }; delete copy[row.uuid]; return copy })}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => setEditing(prev => ({ ...prev, [row.uuid]: { author: row.author, content: row.content, category: Array.isArray(row.category) ? row.category.join(', ') : (typeof row.category === 'string' ? row.category : '') } }))}>Edit</Button>
                          <Button variant="destructive" onClick={() => deleteRow(row.uuid)}>Delete</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
