'use client'

import { useEffect, useRef, useState } from 'react'
import { DEFAULT_BLOG_SERP_PROMPT } from '@/lib/blog-serp-prompt'

export function AdminBlogSerpPrompt({
  onPromptChange,
  defaultOpen = false,
}: {
  /** Current textarea text, including unsaved edits, for the generate call. */
  onPromptChange?: (prompt: string) => void
  defaultOpen?: boolean
}) {
  const [prompt, setPrompt] = useState(DEFAULT_BLOG_SERP_PROMPT)
  const [saved, setSaved] = useState(DEFAULT_BLOG_SERP_PROMPT)
  const [open, setOpen] = useState(defaultOpen)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const onPromptChangeRef = useRef(onPromptChange)
  onPromptChangeRef.current = onPromptChange

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/admin/blog-serp-prompt')
        const data = (await res.json()) as { ok?: boolean; prompt?: string; error?: string }
        if (!res.ok || !data.ok || !data.prompt) {
          throw new Error(data.error || 'Failed to load prompt')
        }
        if (cancelled) return
        setPrompt(data.prompt)
        setSaved(data.prompt)
        onPromptChangeRef.current?.(data.prompt)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load prompt')
          onPromptChangeRef.current?.(DEFAULT_BLOG_SERP_PROMPT)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function update(next: string) {
    setPrompt(next)
    onPromptChange?.(next)
    setMessage(null)
  }

  async function save() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/blog-serp-prompt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = (await res.json()) as { ok?: boolean; prompt?: string; error?: string }
      if (!res.ok || !data.ok || !data.prompt) {
        throw new Error(data.error || 'Failed to save prompt')
      }
      setPrompt(data.prompt)
      setSaved(data.prompt)
      onPromptChange?.(data.prompt)
      setMessage('Prompt saved in settings.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
    } finally {
      setBusy(false)
    }
  }

  const dirty = prompt !== saved

  return (
    <div className="rounded-md border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-ink"
      >
        Edit prompt
        <span className="text-xs font-medium text-ink-muted">
          {open ? 'Hide' : 'Show'}
          {dirty ? ' · unsaved' : ''}
        </span>
      </button>
      {open ? (
        <div className="space-y-2 border-t border-border px-3 py-3">
          <p className="text-xs text-ink-muted">
            Stored in settings. Generate uses the text in this box, including
            edits you have not saved yet. Keep {'{{title}}'}, {'{{category}}'},{' '}
            {'{{excerpt}}'}, and {'{{body}}'} so each post is filled in.
            Descriptions must land at 148–155 characters.
          </p>
          <textarea
            rows={14}
            value={prompt}
            disabled={loading || busy}
            onChange={(e) => update(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs"
          />
          {error ? <p className="text-xs text-red-700">{error}</p> : null}
          {message ? <p className="text-xs text-brand-dark">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || loading || !dirty}
              onClick={() => void save()}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save prompt'}
            </button>
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => update(DEFAULT_BLOG_SERP_PROMPT)}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Reset to default
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
