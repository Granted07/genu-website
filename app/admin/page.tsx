"use client"
import React from 'react'
import { Manrope, Playfair_Display } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '600', '700'] })

type Row = {
  uuid?: string;
  created_at?: string;
  modified_at?: string | null;
  title?: string | null;
  author?: string;
  category?: any;
  content?: string;
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
  
  // Dialog state for articles (Add / Edit)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingRow, setEditingRow] = React.useState<Row | null>(null)

  const [hallRows, setHallRows] = React.useState<HallRow[]>([])
  const [hallForm, setHallForm] = React.useState<{ title: string; author: string; file: File | null }>({ title: '', author: '', file: null })
  const [hallStatus, setHallStatus] = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [hallMessage, setHallMessage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300/60 focus:outline-none'
  
  const tableLabel: Record<typeof table, string> = {
    dod: 'Daughters of Dissent',
    casefiles: 'Case Files',
    signals: 'Signals',
    hall: 'Hall of Noise'
  }
  const activeLabel = tableLabel[table]
  const activeCount = table === 'hall' ? hallRows.length : rows.length
  const rowsWithUuid = rows.filter((row): row is Row & { uuid: string } => typeof row.uuid === 'string' && row.uuid.trim().length > 0)

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

  const parseCategoryInput = (val: any) => {
    if (val == null) return null
    if (Array.isArray(val)) return val.map(String)
    if (typeof val !== 'string') return val
    const trimmed = val.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try { const parsed = JSON.parse(trimmed); return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]; } catch { /* fallthrough */ }
    }
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

  const truncateWords = (text?: string | null, maxWords: number = 10) => {
    if (!text) return ''
    const words = text.split(' ')
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...'
    }
    return text
  }

  async function saveRow() {
    if (table === 'hall' || !editingRow) return
    const uuid = editingRow.uuid
    const rowToSend: any = { ...editingRow }
    rowToSend.category = parseCategoryInput(rowToSend.category)
    const method = uuid ? 'PUT' : 'POST'
    const url = '/api/admin/data'
    const body = uuid ? { table, uuid, row: rowToSend } : { table, row: rowToSend }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      await fetchTable(table)
      setIsDialogOpen(false)
      setEditingRow(null)
    }
  }

  async function deleteRow(uuid: string) {
    if (table === 'hall') return
    if (!confirm("Are you sure you want to delete this row?")) return;
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
    if (!confirm("Are you sure you want to delete this audio?")) return;
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

  const openAddDialog = () => {
    setEditingRow({ title: '', author: '', content: '', category: '' })
    setIsDialogOpen(true)
  }

  const openEditDialog = (row: Row) => {
    setEditingRow({
      ...row,
      category: Array.isArray(row.category) ? row.category.join(', ') : (typeof row.category === 'string' ? row.category : '')
    })
    setIsDialogOpen(true)
  }

  return (
    <div className={`${manrope.className} min-h-screen bg-black text-white pt-[110px]`}>
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
                <Button type="submit" className="text-black font-bold w-full tracking-widest bg-white py-5 hover:bg-gray-200 rounded-3xl mt-10 transition-colors">LOGIN</Button>
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
                <Button onClick={openAddDialog} className="rounded-full bg-white text-black hover:bg-gray-200">
                  Add New Article
                </Button>
              )}
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[700px] border-white/10 bg-[#0a0a0a] text-white">
              <DialogHeader>
                <DialogTitle>{editingRow?.uuid ? 'Edit Article' : 'Add New Article'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-white/60">Title</Label>
                  <Input
                    id="title"
                    value={editingRow?.title || ''}
                    onChange={(e) => setEditingRow(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="author" className="text-white/60">Author</Label>
                  <Input
                    id="author"
                    value={editingRow?.author || ''}
                    onChange={(e) => setEditingRow(prev => prev ? { ...prev, author: e.target.value } : null)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content" className="text-white/60">Content</Label>
                  <Textarea
                    id="content"
                    value={editingRow?.content || ''}
                    onChange={(e) => setEditingRow(prev => prev ? { ...prev, content: e.target.value } : null)}
                    className="min-h-[200px] border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-white/60">Category (comma-separated)</Label>
                  <Input
                    id="category"
                    value={editingRow?.category || ''}
                    onChange={(e) => setEditingRow(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/10 font-normal py-5 px-5 rounded-4xl text-white bg-transparent hover:bg-white/10">
                  Cancel
                </Button>
                <Button onClick={saveRow} className="bg-white rounded-4xl font-normal text-black py-5 px-5 hover:bg-gray-200">
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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

              <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">Title</TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">Author</TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">File</TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">Uploaded</TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hallRows.map((row) => {
                      const key = resolveHallId(row)
                      const link = row.public_url || (row.file_path ? `/storage/${row.file_path}` : null)
                      return (
                        <TableRow key={key} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white/90">{row.title ?? 'Untitled'}</TableCell>
                          <TableCell className="text-white/70">{row.author ?? '—'}</TableCell>
                          <TableCell className="space-y-1">
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
                          </TableCell>
                          <TableCell className="text-sm text-white/60">
                            {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Button variant="destructive" onClick={() => handleHallDelete(row)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {hallRows.length === 0 && (
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableCell colSpan={5} className="py-6 text-center text-sm text-white/50">
                          No uploads yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[20%]">Title</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[15%]">Author</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[35%]">Content</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[15%]">Category</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {rowsWithUuid.map(row => (
                  <TableRow key={row.uuid} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-semibold text-white/90 align-top">
                      {row.title}
                    </TableCell>
                    <TableCell className="text-white/70 align-top">
                      {row.author}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="text-white/80">{truncateWords(row.content, 5)}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="text-sm text-white/60">
                        {Array.isArray(row.category) ? row.category.join(', ') : String(row.category || '')}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => openEditDialog(row)} 
                          className="bg-white text-black hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </Button>
                        <Button variant="destructive" onClick={() => deleteRow(row.uuid)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {rowsWithUuid.length === 0 && (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-white/50">
                      No entries found.
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
