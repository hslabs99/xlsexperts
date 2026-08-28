'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Copy, Plus, Trash2 } from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import type { BlogQueueItem } from '@/lib/blog-queue'

function formatWhen(value: string | null): string {
  if (!value) return '—'
  const t = Date.parse(value)
  return Number.isFinite(t) ? new Date(t).toLocaleString('en-NZ') : '—'
}

function previewText(body: string, max = 140): string {
  const collapsed = body.replace(/\s+/g, ' ').trim()
  if (!collapsed) return '—'
  return collapsed.length > max ? `${collapsed.slice(0, max)}…` : collapsed
}

export function AdminBlogQueuePanel() {
  const [items, setItems] = useState<BlogQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<BlogQueueItem | 'new' | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blog-queue')
      const data = (await res.json()) as {
        ok?: boolean
        items?: BlogQueueItem[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load blog queue')
      }
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openNew() {
    setEditing('new')
    setSubject('')
    setBody('')
    setMessage(null)
    setError(null)
  }

  function openItem(item: BlogQueueItem) {
    setEditing(item)
    setSubject(item.subject)
    setBody(item.body)
    setMessage(null)
    setError(null)
  }

  function backToList() {
    setEditing(null)
    setSubject('')
    setBody('')
  }

  async function handleSave() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const isNew = editing === 'new'
      const res = await fetch('/api/admin/blog-queue', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isNew
            ? { subject, body }
            : { id: editing && editing !== 'new' ? editing.id : '', subject, body }
        ),
      })
      const data = (await res.json()) as {
        ok?: boolean
        item?: BlogQueueItem
        error?: string
      }
      if (!res.ok || !data.ok || !data.item) {
        throw new Error(data.error || 'Save failed')
      }
      setEditing(data.item)
      setSubject(data.item.subject)
      setBody(data.item.body)
      setMessage('Queue item saved.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    const id =
      deleteId ?? (editing && editing !== 'new' ? editing.id : null)
    if (!id) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/blog-queue?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Delete failed')
      }
      setDeleteId(null)
      backToList()
      setMessage('Queue item deleted.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`${label} copied.`)
    } catch {
      setError('Could not copy to the clipboard.')
    }
  }

  if (loading && items.length === 0 && !editing) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading blog queue…
      </div>
    )
  }

  if (editing) {
    const isNew = editing === 'new'
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog queue
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !body}
              onClick={() => void copyText(body, 'Body')}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              <Copy className="h-4 w-4" />
              Copy body
            </button>
            {!isNew && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setDeleteId(editing.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              disabled={busy || !subject.trim()}
              onClick={() => void handleSave()}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {(message || error) && (
          <div
            className={`rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
            role="status"
          >
            {error || message}
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="The blog you intend to write"
            className="rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Notes / AI prompt</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste unstructured prompts, outlines, or paragraphs here. Copy this later into the Blog tool."
            className="min-h-[28rem] rounded-md border border-border px-3 py-2 font-mono text-sm leading-relaxed"
          />
        </label>

        <AdminDialog
          open={Boolean(deleteId)}
          title="Delete this queue item?"
          mode="confirm"
          tone="danger"
          confirmLabel="Delete"
          busy={busy}
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleteId(null)}
        >
          <p className="text-sm text-ink-muted">
            This removes the subject and notes from the blog queue. It does not
            change published blog posts.
          </p>
        </AdminDialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Blog queue</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Store subjects and unstructured AI prompts here, then copy and paste
            them into the Blog tool when you are ready to write the post. Nothing
            in this queue is published on the site.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          New queue item
        </button>
      </div>

      {(message || error) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-brand/30 bg-brand-light text-brand-dark'
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-2.5 font-semibold">Subject</th>
              <th className="px-4 py-2.5 font-semibold">Notes preview</th>
              <th className="px-4 py-2.5 font-semibold whitespace-nowrap">
                Updated
              </th>
              <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No items in the blog queue yet. Add a subject and paste your
                  prompt notes.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="text-left font-semibold text-ink hover:underline"
                    >
                      {item.subject || '(untitled)'}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top text-ink-muted">
                    {previewText(item.body)}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-ink-muted">
                    {formatWhen(item.updatedAt ?? item.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={!item.body}
                        onClick={() => void copyText(item.body, 'Body')}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminDialog
        open={Boolean(deleteId)}
        title="Delete this queue item?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete"
        busy={busy}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteId(null)}
      >
        <p className="text-sm text-ink-muted">
          This removes the subject and notes from the blog queue. It does not
          change published blog posts.
        </p>
      </AdminDialog>
    </div>
  )
}
