'use client'

import { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import { ServicePageExamples } from '@/components/service-page-examples'
import { servicePages } from '@/lib/service-pages'
import {
  selectTilesForServicePage,
  slugifyServicePageTile,
  type ServicePageTileRecord,
} from '@/lib/service-page-tiles-shared'

type EditorMode = 'list' | 'edit' | 'preview'

function emptyRecord(): ServicePageTileRecord {
  return {
    slug: '',
    tag: '',
    title: '',
    detail: '',
    serviceHrefs: [],
    published: true,
    sortOrder: 9999,
    createdAt: null,
    updatedAt: null,
  }
}

export function AdminServicePageTilesPanel() {
  const [rows, setRows] = useState<ServicePageTileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<EditorMode>('list')
  const [form, setForm] = useState<ServicePageTileRecord>(emptyRecord())
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState('')
  const [filterHref, setFilterHref] = useState<string>('all')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [previewHref, setPreviewHref] = useState(
    servicePages[0]?.href ?? '/excel-vba-macro-development'
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/service-page-tiles')
      const data = (await res.json()) as {
        ok?: boolean
        items?: ServicePageTileRecord[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load service page tiles')
      }
      setRows(data.items)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load service page tiles'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (filterHref !== 'all') {
      list = list.filter((r) => r.serviceHrefs.includes(filterHref))
    }
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) =>
      [r.title, r.tag, r.detail, r.slug, ...r.serviceHrefs]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [rows, search, filterHref])

  const previewTiles = useMemo(
    () => selectTilesForServicePage(rows, previewHref),
    [rows, previewHref]
  )

  const previewLabel =
    servicePages.find((p) => p.href === previewHref)?.label ?? previewHref

  function startNew() {
    setForm(emptyRecord())
    setIsNew(true)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function startEdit(row: ServicePageTileRecord) {
    setForm({ ...row, serviceHrefs: [...row.serviceHrefs] })
    setIsNew(false)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function toggleHref(href: string) {
    setForm((prev) => {
      const has = prev.serviceHrefs.includes(href)
      return {
        ...prev,
        serviceHrefs: has
          ? prev.serviceHrefs.filter((h) => h !== href)
          : [...prev.serviceHrefs, href],
      }
    })
  }

  async function save() {
    if (!form.title.trim() || !form.detail.trim()) {
      setError('Title and detail are required')
      return
    }
    if (form.serviceHrefs.length === 0) {
      setError('Assign this tile to at least one service page')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const slug =
        form.slug.trim() || slugifyServicePageTile(form.title) || undefined
      const res = await fetch('/api/admin/service-page-tiles', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          tag: form.tag,
          title: form.title,
          detail: form.detail,
          serviceHrefs: form.serviceHrefs,
          published: form.published,
          sortOrder: form.sortOrder,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        slug?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not save tile')
      }
      setMessage(`Saved “${form.title}”`)
      setMode('list')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save tile')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!form.slug) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/service-page-tiles?slug=${encodeURIComponent(form.slug)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not delete tile')
      }
      setConfirmDelete(false)
      setMode('list')
      setMessage('Tile deleted')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete tile')
    } finally {
      setBusy(false)
    }
  }

  async function toggleServiceHref(row: ServicePageTileRecord, href: string) {
    const has = row.serviceHrefs.includes(href)
    const nextHrefs = has
      ? row.serviceHrefs.filter((h) => h !== href)
      : [...row.serviceHrefs, href]

    if (nextHrefs.length === 0) {
      setError(
        `Keep at least one service page on “${row.title}”, or delete the tile.`
      )
      return
    }

    setBusy(true)
    setError(null)
    setMessage(null)
    // Optimistic UI
    setRows((prev) =>
      prev.map((r) =>
        r.slug === row.slug ? { ...r, serviceHrefs: nextHrefs } : r
      )
    )
    try {
      const res = await fetch('/api/admin/service-page-tiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: row.slug,
          tag: row.tag,
          title: row.title,
          detail: row.detail,
          serviceHrefs: nextHrefs,
          published: row.published,
          sortOrder: row.sortOrder,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not update service pages')
      }
      const label =
        servicePages.find((p) => p.href === href)?.label ?? href
      setMessage(
        has
          ? `Removed “${row.title}” from ${label}`
          : `Added “${row.title}” to ${label}`
      )
    } catch (err) {
      // Revert optimistic update
      setRows((prev) =>
        prev.map((r) =>
          r.slug === row.slug
            ? { ...r, serviceHrefs: row.serviceHrefs }
            : r
        )
      )
      setError(
        err instanceof Error ? err.message : 'Could not update service pages'
      )
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Preview · {previewLabel}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Live layout as visitors see it on that service page (
              {previewTiles.length} tile
              {previewTiles.length === 1 ? '' : 's'}). Homepage is not affected.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={previewHref}
              onChange={(e) => setPreviewHref(e.target.value)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              {servicePages.map((p) => (
                <option key={p.href} value={p.href}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMode('list')}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              Back to list
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <ServicePageExamples
            heading="Examples on this service page"
            subheading="This preview mirrors the public service landing tile grid."
            tiles={previewTiles}
          />
        </div>
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {isNew ? 'New service tile' : 'Edit service tile'}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Assign to one or more service pages. Not shown on the homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode('list')}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              Cancel
            </button>
          </div>

          {(error || message) && (
            <div
              className={`mt-4 rounded-md border p-3 text-sm ${
                error
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-brand/30 bg-brand-light text-brand-dark'
              }`}
            >
              {error || message}
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Title</span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    title: e.target.value,
                    slug: isNew
                      ? slugifyServicePageTile(e.target.value)
                      : p.slug,
                  }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Tag / pill</span>
              <input
                value={form.tag}
                onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
                placeholder="e.g. Finance · VBA · SQL"
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Slug</span>
              <input
                value={form.slug}
                disabled={!isNew}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    slug: slugifyServicePageTile(e.target.value),
                  }))
                }
                className="rounded-md border border-border px-3 py-2 disabled:bg-surface-raised"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Detail</span>
              <textarea
                value={form.detail}
                rows={5}
                onChange={(e) =>
                  setForm((p) => ({ ...p, detail: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Sort order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm pt-6">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((p) => ({ ...p, published: e.target.checked }))
                }
              />
              <span className="font-medium text-ink">Published</span>
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-ink">
              Show on service pages
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Tick every landing page that should display this tile.
            </p>
            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto rounded-md border border-border bg-white p-3 sm:grid-cols-2">
              {servicePages.map((p) => {
                const checked = form.serviceHrefs.includes(p.href)
                return (
                  <label
                    key={p.href}
                    className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                      checked
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-transparent hover:bg-surface-raised'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHref(p.href)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">{p.label}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-ink-muted">
                        {p.href}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface-raised/50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              Card preview
            </p>
            <div className="mt-3 max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              {form.tag ? (
                <span className="mb-3 inline-block rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">
                  {form.tag}
                </span>
              ) : null}
              <h3 className="font-display mb-2 text-lg font-bold text-gray-900">
                {form.title || 'Title'}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {form.detail || 'Detail text appears here.'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save tile'}
            </button>
            {!isNew ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : null}
          </div>
        </div>

        <AdminDialog
          open={confirmDelete}
          title="Delete this tile?"
          mode="confirm"
          tone="danger"
          confirmLabel="Delete permanently"
          busy={busy}
          onClose={() => {
            if (!busy) setConfirmDelete(false)
          }}
          onConfirm={remove}
        >
          <p>
            Permanently remove “{form.title}” from Firestore. Service pages that
            used it will fall back to archive content only if the CMS is empty.
          </p>
        </AdminDialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Service page tiles</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Case-study style cards on individual service landings. Assign each
              tile to one or more service pages. Does not appear on the homepage.
              Seed from Seeding tab to load the original static examples.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('preview')}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              <Eye className="h-4 w-4" />
              Preview page
            </button>
            <button
              type="button"
              onClick={startNew}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" />
              New tile
            </button>
            <button
              type="button"
              disabled={loading || busy}
              onClick={() => void load()}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        {(error || message) && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tiles…"
            className="min-w-[200px] flex-1 rounded-md border border-border px-3 py-2 text-sm"
          />
          <select
            value={filterHref}
            onChange={(e) => setFilterHref(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="all">All service pages</option>
            {servicePages.map((p) => (
              <option key={p.href} value={p.href}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          Showing {filtered.length} of {rows.length} tile
          {rows.length === 1 ? '' : 's'}
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="px-2 py-2">Order</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Tag</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-ink-muted">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-ink-muted">
                    No tiles yet. Use Seeding → “Seed service page tiles” to
                    import the static examples, or create a new tile.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <Fragment key={row.slug}>
                    <tr className="border-b border-border/40 hover:bg-brand-light/10">
                      <td className="px-2 pt-3 pb-1 text-xs text-ink-muted align-top">
                        {row.sortOrder}
                      </td>
                      <td className="px-2 pt-3 pb-1 font-medium text-ink align-top">
                        {row.title}
                      </td>
                      <td className="px-2 pt-3 pb-1 text-xs align-top">
                        {row.tag || '—'}
                      </td>
                      <td className="px-2 pt-3 pb-1 text-xs align-top">
                        {row.published ? (
                          <span className="font-semibold text-emerald-700">
                            Published
                          </span>
                        ) : (
                          <span className="text-amber-700">Draft</span>
                        )}
                      </td>
                      <td className="px-2 pt-3 pb-1 align-top">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-border/70">
                      <td colSpan={5} className="px-2 pb-3 pt-0">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                          Service pages — click to tag / untag
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {servicePages.map((p) => {
                            const on = row.serviceHrefs.includes(p.href)
                            return (
                              <button
                                key={p.href}
                                type="button"
                                disabled={busy}
                                title={
                                  on
                                    ? `Remove from ${p.label}`
                                    : `Add to ${p.label}`
                                }
                                onClick={() =>
                                  void toggleServiceHref(row, p.href)
                                }
                                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
                                  on
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                                    : 'border-stone-200 bg-stone-50 text-stone-400 hover:border-stone-300 hover:bg-stone-100 hover:text-stone-600'
                                }`}
                              >
                                {p.label}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
