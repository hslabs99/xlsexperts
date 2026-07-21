'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AdminBlogPreviewShell,
  type BlogPreviewKind,
} from '@/components/admin-blog-preview'
import type { BlogPost } from '@/lib/types'
import type {
  BlogSeedHarvestItemResult,
  BlogSeedTodoItem,
  BlogSeedTodoStatus,
} from '@/lib/blog-seed-todo-shared'

const STATUS_STYLES: Record<BlogSeedTodoStatus | 'running', string> = {
  pending: 'bg-surface-raised text-ink-muted',
  imported: 'bg-emerald-50 text-emerald-800',
  duplicate: 'bg-amber-50 text-amber-900',
  failed: 'bg-red-50 text-red-800',
  skipped: 'bg-slate-100 text-slate-700',
  running: 'bg-sky-50 text-sky-900',
}

type Props = {
  busy: boolean
  setBusy: (v: boolean) => void
  onMessage: (message: string | null, error?: string | null) => void
}

type ProgressLine = {
  id: string
  tone: 'info' | 'ok' | 'warn' | 'err'
  text: string
}

type PreviewPost = BlogPost & {
  published?: boolean
  sourceUrl?: string
  sourceImageUrl?: string
}

async function readApiJson(res: Response): Promise<{
  ok: boolean
  data: Record<string, unknown>
  raw: string
}> {
  const raw = await res.text()
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    return { ok: res.ok && data.ok !== false, data, raw }
  } catch {
    return {
      ok: false,
      data: {
        error: `Server returned non-JSON (HTTP ${res.status}). ${raw.slice(0, 400)}`,
      },
      raw,
    }
  }
}

function toPreviewPost(
  raw: BlogSeedHarvestItemResult['post'] | Record<string, unknown>
): PreviewPost | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (!p.slug || !p.title) return null
  return {
    slug: String(p.slug),
    title: String(p.title ?? ''),
    author: String(p.author ?? ''),
    date: String(p.date ?? ''),
    readTime: String(p.readTime ?? ''),
    excerpt: String(p.excerpt ?? ''),
    image: String(p.image ?? ''),
    category: String(p.category ?? ''),
    sections: Array.isArray(p.sections)
      ? (p.sections as BlogPost['sections'])
      : [],
    published: p.published !== false,
    sourceUrl: typeof p.sourceUrl === 'string' ? p.sourceUrl : undefined,
    sourceImageUrl:
      typeof p.sourceImageUrl === 'string' ? p.sourceImageUrl : undefined,
  }
}

/**
 * Wix → draft blogPosts harvest queue (`blog_seed_todo`).
 * Sync constant URLs, select rows, run seed_missing_blogs on a sample, preview drafts.
 */
export function AdminWixBlogSeedPanel({ busy, setBusy, onMessage }: Props) {
  const [items, setItems] = useState<BlogSeedTodoItem[]>([])
  const [constantCount, setConstantCount] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [overwriteDrafts, setOverwriteDrafts] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | BlogSeedTodoStatus>(
    'all'
  )
  const [lastResults, setLastResults] = useState<BlogSeedHarvestItemResult[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [runningSlug, setRunningSlug] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressLine[]>([])
  const [panelError, setPanelError] = useState<string | null>(null)
  const [previewPost, setPreviewPost] = useState<PreviewPost | null>(null)
  const [previewKind, setPreviewKind] = useState<BlogPreviewKind>('list')
  const [previewLoading, setPreviewLoading] = useState(false)
  const postCacheRef = useRef<Map<string, PreviewPost>>(new Map())
  const progressEndRef = useRef<HTMLDivElement | null>(null)

  function pushProgress(tone: ProgressLine['tone'], text: string) {
    setProgress((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, tone, text },
    ])
  }

  function openPreview(post: PreviewPost, kind: BlogPreviewKind = 'list') {
    postCacheRef.current.set(post.slug, post)
    setPreviewKind(kind)
    setPreviewPost(post)
  }

  async function previewSlug(slug: string, kind: BlogPreviewKind = 'list') {
    const cached = postCacheRef.current.get(slug)
    if (cached) {
      // Prefer latest sourceUrl from queue row if cache is missing it
      const row = items.find((i) => i.slug === slug)
      if (row?.sourceUrl && !cached.sourceUrl) {
        openPreview({ ...cached, sourceUrl: row.sourceUrl }, kind)
      } else {
        openPreview(cached, kind)
      }
      return
    }
    setPreviewLoading(true)
    setPanelError(null)
    try {
      const res = await fetch('/api/admin/blogs')
      const { ok, data } = await readApiJson(res)
      if (!ok) throw new Error(String(data.error || 'Could not load blogs'))
      const list = (data.items as Record<string, unknown>[]) ?? []
      const found = list.find((p) => String(p.slug) === slug)
      const post = found ? toPreviewPost(found) : null
      if (!post) {
        throw new Error(
          `No blogPosts/${slug} found. Import it first, then preview.`
        )
      }
      const row = items.find((i) => i.slug === slug)
      if (row?.sourceUrl) post.sourceUrl = row.sourceUrl
      openPreview(post, kind)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Preview failed'
      setPanelError(msg)
      onMessage(null, msg)
    } finally {
      setPreviewLoading(false)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setPanelError(null)
    try {
      const res = await fetch('/api/admin/blog-seed-todo')
      const { ok, data } = await readApiJson(res)
      if (!ok) {
        throw new Error(String(data.error || 'Failed to load blog_seed_todo'))
      }
      setItems((data.items as BlogSeedTodoItem[]) ?? [])
      setConstantCount(Number(data.constantCount ?? 0))
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load harvest queue'
      setPanelError(msg)
      onMessage(null, msg)
    } finally {
      setLoading(false)
    }
    // Parent passes an inline callback; do not re-fetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    progressEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [progress])

  useEffect(() => {
    if (!previewPost) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPreviewPost(null)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [previewPost])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return items
    return items.filter((i) => i.status === statusFilter)
  }, [items, statusFilter])

  const selectedInView = useMemo(
    () => filtered.filter((i) => selected.has(i.slug)).map((i) => i.slug),
    [filtered, selected]
  )

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function selectFirst(n: number) {
    const next = new Set<string>()
    for (const row of filtered.slice(0, n)) next.add(row.slug)
    setSelected(next)
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((i) => i.slug)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function syncConstant() {
    setBusy(true)
    setPanelError(null)
    onMessage(null, null)
    setProgress([])
    pushProgress('info', 'Syncing blog_seed_todo from URL constant…')
    try {
      const res = await fetch('/api/admin/blog-seed-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })
      const { ok, data } = await readApiJson(res)
      if (!ok) throw new Error(String(data.error || 'Sync failed'))
      setItems((data.items as BlogSeedTodoItem[]) ?? [])
      const msg = `Synced queue → created ${data.created}, updated ${data.updated}, total ${data.total}.`
      pushProgress('ok', msg)
      onMessage(msg)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed'
      setPanelError(msg)
      pushProgress('err', msg)
      onMessage(null, msg)
    } finally {
      setBusy(false)
    }
  }

  async function markAsWaiting(slugs: string[]) {
    if (!slugs.length) {
      const msg = 'Select one or more rows to mark as waiting.'
      setPanelError(msg)
      onMessage(null, msg)
      return
    }
    setBusy(true)
    setPanelError(null)
    onMessage(null, null)
    pushProgress(
      'info',
      `Marking ${slugs.length} row(s) as waiting (pending) so they can be re-imported…`
    )
    try {
      const res = await fetch('/api/admin/blog-seed-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          slugs,
          status: 'pending',
        }),
      })
      const { ok, data } = await readApiJson(res)
      if (!ok) throw new Error(String(data.error || 'Could not mark as waiting'))
      setItems((data.items as BlogSeedTodoItem[]) ?? [])
      const msg = `Marked ${data.reset} row(s) as waiting. Re-run Seed missing blogs — existing drafts will be replaced.`
      pushProgress('ok', msg)
      onMessage(msg)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not mark as waiting'
      setPanelError(msg)
      pushProgress('err', msg)
      onMessage(null, msg)
    } finally {
      setBusy(false)
    }
  }

  async function resetSelected() {
    await markAsWaiting(selectedInView)
  }

  async function deleteSelected() {
    if (!selectedInView.length) {
      const msg = 'Select row(s) to remove from the queue.'
      setPanelError(msg)
      onMessage(null, msg)
      return
    }
    setBusy(true)
    setPanelError(null)
    onMessage(null, null)
    pushProgress('info', `Deleting ${selectedInView.length} queue row(s)…`)
    try {
      for (const slug of selectedInView) {
        const res = await fetch(
          `/api/admin/blog-seed-todo?slug=${encodeURIComponent(slug)}`,
          { method: 'DELETE' }
        )
        const { ok, data } = await readApiJson(res)
        if (!ok) {
          throw new Error(String(data.error || `Delete failed for ${slug}`))
        }
        pushProgress('ok', `Deleted ${slug}`)
      }
      clearSelection()
      await load()
      onMessage('Removed selected row(s) from blog_seed_todo.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      setPanelError(msg)
      pushProgress('err', msg)
      onMessage(null, msg)
    } finally {
      setBusy(false)
    }
  }

  async function runHarvest(slugs: string[]) {
    if (!slugs.length) {
      const msg =
        'Select one or two posts first. Use “Select first 2” while tuning the import.'
      setPanelError(msg)
      onMessage(null, msg)
      return
    }

    setBusy(true)
    setPanelError(null)
    onMessage(null, null)
    setLastResults([])
    setProgress([])
    pushProgress(
      'info',
      `Starting harvest of ${slugs.length} post(s). Imports are drafts (published=false). Overwrite drafts: ${overwriteDrafts ? 'yes' : 'no'}.`
    )

    const results: BlogSeedHarvestItemResult[] = []
    let lastImported: PreviewPost | null = null

    try {
      for (let i = 0; i < slugs.length; i += 1) {
        const slug = slugs[i]
        setRunningSlug(slug)
        pushProgress(
          'info',
          `(${i + 1}/${slugs.length}) Fetching & importing ${slug}…`
        )

        setItems((prev) =>
          prev.map((row) =>
            row.slug === slug
              ? { ...row, lastError: 'Running…', status: row.status }
              : row
          )
        )

        const res = await fetch('/api/admin/seed-missing-blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs: [slug], overwriteDrafts }),
        })
        const { ok, data, raw } = await readApiJson(res)

        if (!ok) {
          const errText = String(
            data.error ||
              `HTTP ${res.status} from /api/admin/seed-missing-blogs. ${raw.slice(0, 300)}`
          )
          const failItem: BlogSeedHarvestItemResult = {
            slug,
            sourceUrl: items.find((x) => x.slug === slug)?.sourceUrl ?? '',
            status: 'failed',
            error: errText,
          }
          results.push(failItem)
          pushProgress('err', `FAILED ${slug}: ${errText}`)
          setItems((prev) =>
            prev.map((row) =>
              row.slug === slug
                ? { ...row, status: 'failed', lastError: errText }
                : row
            )
          )
          if (res.status >= 500) {
            setPanelError(errText)
            onMessage(null, errText)
            break
          }
          continue
        }

        const batchItems = (data.items as BlogSeedHarvestItemResult[]) ?? []
        const item = batchItems[0] ?? {
          slug,
          sourceUrl: '',
          status: 'failed' as const,
          error: 'API returned no item result',
        }
        results.push(item)

        if (item.status === 'imported' && item.post) {
          const post = toPreviewPost(item.post)
          if (post) {
            postCacheRef.current.set(post.slug, post)
            lastImported = post
          }
        }

        const tone: ProgressLine['tone'] =
          item.status === 'imported'
            ? 'ok'
            : item.status === 'duplicate'
              ? 'warn'
              : item.status === 'failed'
                ? 'err'
                : 'info'

        const detail = [
          item.title,
          item.sectionCount != null ? `${item.sectionCount} sections` : null,
          item.imageUploaded
            ? 'hero → Storage'
            : item.imageNote
              ? `hero: ${item.imageNote}`
              : null,
          item.error && item.imageUploaded ? item.error : null,
          item.duplicateNote,
        ]
          .filter(Boolean)
          .join(' · ')

        pushProgress(
          tone,
          `${item.status.toUpperCase()} ${slug}${detail ? ` — ${detail}` : ''}`
        )

        setItems((prev) =>
          prev.map((row) =>
            row.slug === slug
              ? {
                  ...row,
                  status: item.status,
                  title: item.title ?? row.title,
                  category: item.category ?? row.category,
                  lastError: item.error,
                  duplicateNote: item.duplicateNote,
                  lastHttpStatus: item.httpStatus,
                }
              : row
          )
        )
      }

      setLastResults(results)
      const imported = results.filter((r) => r.status === 'imported').length
      const duplicates = results.filter((r) => r.status === 'duplicate').length
      const failed = results.filter((r) => r.status === 'failed').length
      const summary = `Done. Imported ${imported}, duplicates ${duplicates}, failed ${failed} (of ${results.length}).`
      pushProgress(failed > 0 ? 'warn' : 'ok', summary)

      if (lastImported) {
        pushProgress(
          'info',
          `Opening preview for “${lastImported.title}” (list + full article).`
        )
        openPreview(lastImported, 'list')
      }

      if (failed > 0) {
        const firstFail = results.find((r) => r.status === 'failed')
        setPanelError(firstFail?.error || summary)
        onMessage(summary, firstFail?.error || null)
      } else {
        onMessage(summary)
      }
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Harvest failed'
      setPanelError(msg)
      pushProgress('err', msg)
      onMessage(null, msg)
    } finally {
      setRunningSlug(null)
      setBusy(false)
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      pending: 0,
      imported: 0,
      duplicate: 0,
      failed: 0,
      skipped: 0,
    }
    for (const i of items) c[i.status] = (c[i.status] ?? 0) + 1
    return c
  }, [items])

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-base font-semibold text-ink">
        Missing blogs (Wix harvest)
      </h3>
      <p className="mt-1 max-w-3xl text-sm text-ink-muted">
        Queue: Firestore <code className="text-xs">blog_seed_todo</code>, sourced
        from <code className="text-xs">lib/wix-blog-seed-urls.ts</code>. To
        re-import an already imported draft: click <strong>→ waiting</strong>{' '}
        (or Mark selected as waiting), then Seed again. Published posts are never
        overwritten.
      </p>

      {(panelError || progress.length > 0) && (
        <div className="mt-4 space-y-2">
          {panelError ? (
            <div
              className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
              role="alert"
            >
              <div className="font-semibold">Harvest error</div>
              <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs">
                {panelError}
              </pre>
            </div>
          ) : null}

          {progress.length > 0 ? (
            <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-white p-3 font-mono text-xs">
              {progress.map((line) => (
                <div
                  key={line.id}
                  className={
                    line.tone === 'err'
                      ? 'text-red-700'
                      : line.tone === 'warn'
                        ? 'text-amber-800'
                        : line.tone === 'ok'
                          ? 'text-emerald-800'
                          : 'text-ink-muted'
                  }
                >
                  {line.text}
                </div>
              ))}
              <div ref={progressEndRef} />
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
        <span>
          Constant: {constantCount} · Queue: {items.length}
        </span>
        <span>
          pending {counts.pending} · imported {counts.imported} · duplicate{' '}
          {counts.duplicate} · failed {counts.failed}
        </span>
        {runningSlug ? (
          <span className="font-semibold text-sky-800">
            Running: {runningSlug}
          </span>
        ) : null}
        {previewLoading ? (
          <span className="font-semibold text-ink">Loading preview…</span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void syncConstant()}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Sync queue from constant
        </button>
        <button
          type="button"
          disabled={busy || !selectedInView.length}
          onClick={() => void runHarvest(selectedInView)}
          className="rounded-md border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/20 disabled:opacity-60"
        >
          {busy && runningSlug
            ? `Harvesting… (${selectedInView.indexOf(runningSlug) + 1}/${selectedInView.length})`
            : `Seed missing blogs (${selectedInView.length})`}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => selectFirst(2)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Select first 2
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={selectAllFiltered}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Select filtered
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={clearSelection}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Clear selection
        </button>
        <button
          type="button"
          disabled={busy || !selectedInView.length}
          onClick={() => void resetSelected()}
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
          title="Sets status to waiting (pending). Re-seed will replace existing drafts."
        >
          Mark selected as waiting
        </button>
        <button
          type="button"
          disabled={busy || !selectedInView.length}
          onClick={() => void deleteSelected()}
          className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
        >
          Delete selected rows
        </button>
        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void load()}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={overwriteDrafts}
          disabled={busy}
          onChange={(e) => setOverwriteDrafts(e.target.checked)}
        />
        Overwrite existing drafts on re-run (published posts always skipped).
        Rows marked <em>waiting</em> also re-import drafts even if this is off.
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-muted">Filter:</span>
        {(
          ['all', 'pending', 'imported', 'duplicate', 'failed', 'skipped'] as const
        ).map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => setStatusFilter(s)}
            className={`rounded-md border px-2 py-1 text-xs font-medium ${
              statusFilter === s
                ? 'border-brand bg-brand-light text-brand-dark'
                : 'border-border bg-white text-ink-muted hover:bg-surface-raised'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-raised text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2 w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Slug / title</th>
              <th className="px-3 py-2">Old Wix URL</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !items.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-ink-muted">
                  Loading queue…
                </td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-ink-muted">
                  Queue empty — click &quot;Sync queue from constant&quot; to
                  load {constantCount || 'the'} Wix URLs.
                </td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isRunning = runningSlug === row.slug
              const canPreview =
                row.status === 'imported' || postCacheRef.current.has(row.slug)
              return (
                <tr
                  key={row.slug}
                  className={`border-t border-border align-top ${
                    isRunning ? 'bg-sky-50' : 'hover:bg-surface-raised/50'
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.slug)}
                      disabled={busy}
                      onChange={() => toggle(row.slug)}
                      aria-label={`Select ${row.slug}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-ink-muted tabular-nums">
                    {row.sortOrder + 1}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[isRunning ? 'running' : row.status]
                      }`}
                    >
                      {isRunning ? 'running' : row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-ink">
                      {row.title || '—'}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-ink-muted break-all">
                      {row.slug}
                    </div>
                    {row.category ? (
                      <div className="mt-0.5 text-xs text-ink-muted">
                        {row.category}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    {row.sourceUrl ? (
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all font-mono text-xs text-brand-dark underline-offset-2 hover:underline"
                        title="Open original Wix post in a new tab"
                      >
                        {row.sourceUrl.replace(
                          /^https:\/\/mike6546\.wixsite\.com\/xlsexperts\/post\//,
                          '…/post/'
                        )}
                      </a>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-muted max-w-xs">
                    {isRunning
                      ? 'Fetching Wix → parse → upload hero → save draft…'
                      : row.lastError || row.duplicateNote || '—'}
                    {!isRunning && row.lastHttpStatus ? (
                      <span className="ml-1 tabular-nums">
                        (HTTP {row.lastHttpStatus})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {row.sourceUrl ? (
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-brand-dark underline-offset-2 hover:underline"
                      >
                        Open Wix
                      </a>
                    ) : null}
                    {row.status === 'imported' ||
                    row.status === 'duplicate' ||
                    row.status === 'failed' ||
                    row.status === 'skipped' ? (
                      <>
                        {row.sourceUrl ? ' · ' : null}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void markAsWaiting([row.slug])}
                          className="font-semibold text-amber-900 underline-offset-2 hover:underline disabled:opacity-60"
                          title="Set status to waiting so this row can be re-seeded"
                        >
                          → waiting
                        </button>
                      </>
                    ) : null}
                    {canPreview ? (
                      <>
                        {' · '}
                        <button
                          type="button"
                          disabled={busy || previewLoading}
                          onClick={() => void previewSlug(row.slug, 'list')}
                          className="font-semibold text-brand-dark underline-offset-2 hover:underline disabled:opacity-60"
                        >
                          Preview
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {lastResults.length > 0 ? (
        <div className="mt-4 rounded-md border border-border bg-surface-raised p-3">
          <h4 className="text-sm font-semibold text-ink">Last run report</h4>
          <ul className="mt-2 space-y-2 text-xs text-ink-muted">
            {lastResults.map((r) => (
              <li key={r.slug} className="break-all">
                <div>
                  <span className="font-semibold text-ink">[{r.status}]</span>{' '}
                  <span className="font-mono">{r.slug}</span>
                  {r.title ? ` — ${r.title}` : ''}
                  {r.sectionCount != null ? ` · ${r.sectionCount} sections` : ''}
                </div>
                {r.sourceUrl ? (
                  <div className="mt-0.5">
                    Wix:{' '}
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-dark underline-offset-2 hover:underline"
                    >
                      {r.sourceUrl}
                    </a>
                  </div>
                ) : null}
                <div className="mt-0.5">
                  Image:{' '}
                  {r.imageUploaded
                    ? 'uploaded to Storage'
                    : r.imageNote || 'not uploaded'}
                  {r.sourceImageUrl ? (
                    <>
                      {' · '}
                      <a
                        href={r.sourceImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-dark underline-offset-2 hover:underline"
                      >
                        source hero
                      </a>
                    </>
                  ) : null}
                </div>
                {r.error || r.duplicateNote ? (
                  <div className="mt-0.5 text-red-800">
                    {r.error || r.duplicateNote}
                  </div>
                ) : null}
                {r.status === 'imported' ? (
                  <div className="mt-1">
                    <button
                      type="button"
                      disabled={previewLoading}
                      onClick={() => void previewSlug(r.slug, 'list')}
                      className="font-semibold text-brand-dark underline-offset-2 hover:underline"
                    >
                      Preview list
                    </button>
                    {' / '}
                    <button
                      type="button"
                      disabled={previewLoading}
                      onClick={() => void previewSlug(r.slug, 'article')}
                      className="font-semibold text-brand-dark underline-offset-2 hover:underline"
                    >
                      Full article
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {previewPost ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/50 p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Blog preview"
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="shrink-0 border-b border-border bg-surface-raised px-4 py-3 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Compare with original
                  </p>
                  {previewPost.sourceUrl ? (
                    <a
                      href={previewPost.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block break-all font-mono text-sm font-semibold text-brand-dark underline-offset-2 hover:underline"
                    >
                      {previewPost.sourceUrl}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-ink-muted">
                      No Wix source URL on this draft.
                    </p>
                  )}
                  <p className="mt-2 break-all text-xs text-ink-muted">
                    Imported image:{' '}
                    {previewPost.image ? (
                      <a
                        href={previewPost.image}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-dark underline-offset-2 hover:underline"
                      >
                        {previewPost.image.startsWith(
                          'https://firebasestorage'
                        )
                          ? 'Firebase Storage ✓'
                          : previewPost.image.includes('wixstatic')
                            ? 'Still on Wix (upload failed — using remote URL)'
                            : previewPost.image.slice(0, 80)}
                      </a>
                    ) : (
                      <span className="text-red-700">missing</span>
                    )}
                    {previewPost.sourceImageUrl ? (
                      <>
                        {' · '}
                        <a
                          href={previewPost.sourceImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-dark underline-offset-2 hover:underline"
                        >
                          Wix hero file
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPost(null)}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <AdminBlogPreviewShell
                post={previewPost}
                kind={previewKind}
                onKindChange={setPreviewKind}
                onClose={() => setPreviewPost(null)}
                closeLabel="Close preview"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
