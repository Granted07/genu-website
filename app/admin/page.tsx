"use client"
import React from 'react'
import { Button } from '@/components/ui/button'

type Row = {
  uuid: string;
  created_at: string;
  modified_at?: string | null;
  author: string;
  category?: any;
  content: string;
  reading_time?: string | null;
}

export default function AdminPage() {
  const [password, setPassword] = React.useState('')
  const [status, setStatus] = React.useState<'idle'|'loading'|'ok'|'error'>('idle')
  const [token, setToken] = React.useState('')
  const [table, setTable] = React.useState<'dod'|'casefiles'|'signals'>('dod')
  const [rows, setRows] = React.useState<Row[]>([])
  const [editing, setEditing] = React.useState<Record<string, Partial<Row>>>({})

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

  async function saveRow(uuid?: string) {
    const edit = editing[uuid || 'new']
    if (!edit) return
    const rowToSend: any = { ...edit }
    rowToSend.category = parseCategoryInput(edit.category)
    const payload = { table, row: rowToSend }
    const method = uuid ? 'PUT' : 'POST'
    const url = uuid ? '/api/admin/data' : '/api/admin/data'
    const body = uuid ? { table, uuid, row: edit } : { table, row: edit }
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
    const res = await fetch(`/api/admin/data?table=${table}&uuid=${uuid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) fetchTable(table)
  }

  React.useEffect(() => {
    if (status === 'ok') fetchTable(table)
  }, [table, status])

  return (
    <div className="min-h-screen p-6 bg-background text-foreground pt-[72px]">
      {status !== 'ok' ? (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-input text-foreground"
          />
          <Button type="submit">Login</Button>
          {status === 'error' && <div className="text-red-500">Invalid password</div>}
        </form>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 mb-4">
            <Button variant={table === 'dod' ? 'default' : 'secondary'} onClick={() => setTable('dod')}>DOD</Button>
            <Button variant={table === 'casefiles' ? 'default' : 'secondary'} onClick={() => setTable('casefiles')}>Case Files</Button>
            <Button variant={table === 'signals' ? 'default' : 'secondary'} onClick={() => setTable('signals')}>Signals</Button>
            <Button onClick={() => setEditing(prev => ({ ...prev, new: { author: '', content: '', category: '' } }))}>Add New</Button>
          </div>

          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="text-left">Author</th>
                <th className="text-left">Content</th>
                <th className="text-left">Category</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(editing).map(([key, val]) => key === 'new' ? (
                <tr key={key} className="bg-muted">
                  <td><input value={val.author || ''} onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], author: e.target.value } }))} /></td>
                  <td><input value={val.content || ''} onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], content: e.target.value } }))} /></td>
                  <td><input value={val.category || ''} onChange={e => setEditing(prev => ({ ...prev, [key]: { ...prev[key], category: e.target.value } }))} /></td>
                  <td><Button onClick={() => saveRow(undefined)}>Save</Button></td>
                </tr>
              ) : null)}

              {rows.map(row => (
                <tr key={row.uuid} className="border-t">
                  <td>
                    {editing[row.uuid] ? (
                      <input value={editing[row.uuid].author || row.author} onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], author: e.target.value } }))} />
                    ) : row.author}
                  </td>
                  <td>
                    {editing[row.uuid] ? (
                      <input value={editing[row.uuid].content || row.content} onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], content: e.target.value } }))} />
                    ) : <div className="line-clamp-3">{row.content}</div>}
                  </td>
                  <td>
                    {editing[row.uuid] ? (
                      <input value={editing[row.uuid].category ?? (Array.isArray(row.category) ? row.category.join(', ') : (typeof row.category === 'string' ? row.category : ''))} onChange={e => setEditing(prev => ({ ...prev, [row.uuid]: { ...prev[row.uuid], category: e.target.value } }))} />
                    ) : <div className="text-sm">{Array.isArray(row.category) ? row.category.join(', ') : String(row.category)}</div>}
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
  )
}
