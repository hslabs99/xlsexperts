'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload, Home, Eye } from 'lucide-react'
import {
  HOME_CASE_STUDIES_LIMIT,
  deleteCaseStudy,
  fetchAllCaseStudyRecords,
  publishHomeCaseStudiesSnapshot,
  saveCaseStudy,
  selectHomeCaseStudies,
  updateCaseStudyFields,
  type CaseStudyRecord,
} from '@/lib/case-studies-db'
import {
  formatStorageError,
  importCaseStudySiteImageToStorage,
  uploadCaseStudyImage,
} from '@/lib/case-studies-storage'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import {
  AdminCaseStudiesPreviewShell,
  type CaseStudyPreviewKind,
} from '@/components/admin-case-studies-preview'

type EditorMode = 'list' | 'edit' | 'preview'

function emptyRecord(): CaseStudyRecord {
  return {
    slug: '',
    client: '',
    sector: '',
    title: '',
    image: '',
    problem: '',
    solution: '',
    outcome: '',
    tags: [],
    published: true,
    showOnHome: false,
    homeOrder: 9999,
    sortOrder: 9999,
    createdAt: null,
    updatedAt: null,
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function AdminCaseStudiesPanel() {
  const [rows, setRows] = useState<CaseStudyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<EditorMode>('list')
  const [form, setForm] = useState<CaseStudyRecord>(emptyRecord())
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [previewKind, setPreviewKind] = useState<CaseStudyPreviewKind>('card')
  const [previewSlug, setPreviewSlug] = useState('')
  const [previewReturn, setPreviewReturn] = useState<'list' | 'edit'>('list')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchAllCaseStudyRecords())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load case studies'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.title, r.client, r.sector, r.slug].join(' ').toLowerCase().includes(q)
    )
  }, [rows, search])

  const homePreview = useMemo(() => selectHomeCaseStudies(rows), [rows])

  function startNew() {
    setForm(emptyRecord())
    setTagsText('')
    setPendingImageFile(null)
    setIsNew(true)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function startEdit(row: CaseStudyRecord) {
    setForm({ ...row, tags: [...row.tags] })
    setTagsText(row.tags.join(', '))
    setPendingImageFile(null)
    setIsNew(false)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function openPreview(
    kind: CaseStudyPreviewKind,
    row?: CaseStudyRecord,
    returnTo: 'list' | 'edit' = row ? 'list' : 'edit'
  ) {
    const slug = (
      row?.slug ||
      form.slug ||
      (kind === 'home' ? homePreview[0]?.slug : '') ||
      ''
    ).trim()
    if (kind === 'card' && !slug) {
      setError('Save the case study to Firestore first, then preview.')
      return
    }
    if (row) {
      setIsNew(false)
      setForm({ ...row, tags: [...row.tags] })
      setTagsText(row.tags.join(', '))
    }
    setPreviewReturn(returnTo)
    setPreviewSlug(slug)
    setPreviewKind(kind)
    setMode('preview')
    setMessage(null)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      let slug = form.slug.trim() || slugify(`${form.client}-${form.title}`)
      if (!slug) throw new Error('Slug is required')
      if (!form.title.trim()) throw new Error('Title is required')

      let image = form.image.trim()
      if (pendingImageFile) {
        image = await uploadCaseStudyImage(slug, pendingImageFile)
      }

      const homeOn = Boolean(form.showOnHome)
      const homeAlready = rows.filter(
        (r) => r.showOnHome && r.slug !== slug
      ).length
      if (homeOn && homeAlready >= HOME_CASE_STUDIES_LIMIT) {
        throw new Error(
          `Homepage already has ${HOME_CASE_STUDIES_LIMIT} studies. Turn one off before adding another, or raise homeOrder after publishing.`
        )
      }

      const payload = {
        ...form,
        slug,
        image,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        showOnHome: homeOn,
        homeOrder: homeOn
          ? typeof form.homeOrder === 'number' && form.homeOrder < 9000
            ? form.homeOrder
            : homeAlready
          : 9999,
      }

      await saveCaseStudy(payload)
      setMessage('Case study saved.')
      setPendingImageFile(null)
      await load()
      setMode('list')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!form.slug || isNew) return
    if (!window.confirm(`Delete “${form.title}”?`)) return
    setBusy(true)
    setError(null)
    try {
      await deleteCaseStudy(form.slug)
      setMessage('Case study deleted.')
      await load()
      setMode('list')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function handlePublishHome() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const snap = await publishHomeCaseStudiesSnapshot(rows)
      setMessage(
        `Homepage snapshot published (${snap.items.length} card${snap.items.length === 1 ? '' : 's'}). Public site reads this document only — no live collection query on first paint.`
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to publish homepage snapshot'
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleSeed(uploadImages: boolean) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/seed-case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overwrite: true,
          uploadImages,
          publishHome: true,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        created?: number
        updated?: number
        skipped?: number
        imagesUploaded?: number
        imagesFailed?: number
        homePublished?: boolean
        lastImageError?: string
        hint?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Seed failed')
      }
      const summary = `Seeded archive → created ${data.created ?? 0}, updated ${data.updated ?? 0}, skipped ${data.skipped ?? 0}. Images uploaded ${data.imagesUploaded ?? 0}, failed ${data.imagesFailed ?? 0}.${data.lastImageError ? ` Last image error: ${data.lastImageError}` : ''} Homepage snapshot: ${data.homePublished ? 'yes' : 'no'}.`
      if (data.hint) {
        setMessage(`${summary} — ${data.hint}`)
      } else {
        setMessage(summary)
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seed failed')
    } finally {
      setBusy(false)
    }
  }

  /**
   * Browser-side Storage push: fetches /images/cs-*.png from this origin and
   * uploads via the client SDK (often clearer than the Node API route).
   */
  async function handlePublishEmailThumbs() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/publish-email-case-study-thumbs', {
        method: 'POST',
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        uploaded?: number
        failed?: number
        lastError?: string
        hint?: string
      }
      if (!res.ok || data.ok === false) {
        throw new Error(
          data.error ||
            data.lastError ||
            'Failed to publish email thumbs to Storage'
        )
      }
      setMessage(
        `Email thumbs → uploaded ${data.uploaded ?? 0}, failed ${data.failed ?? 0}.${data.lastError ? ` Last error: ${data.lastError}` : ''}${data.hint ? ` — ${data.hint}` : ''} Stored in Site Content email-case-study-thumbs (Firebase Storage paths email/case-studies/*.jpg).`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email thumbs publish failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleBrowserImagePush() {
    setBusy(true)
    setError(null)
    setMessage(null)
    let uploaded = 0
    let failed = 0
    let lastErr: string | undefined
    try {
      for (const item of CASE_STUDIES_ARCHIVE) {
        try {
          const res = await fetch(item.localImage)
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} for ${item.localImage}`)
          }
          const blob = await res.blob()
          const bytes = new Uint8Array(await blob.arrayBuffer())
          // Keep under Storage pain thresholds; browser canvas resize is heavy —
          // upload JPEG-converted only if we can do a quick type; else raw PNG.
          const url = await uploadCaseStudyImage(
            item.slug,
            bytes,
            'hero.png',
            blob.type || 'image/png'
          )
          if (rows.some((r) => r.slug === item.slug)) {
            await updateCaseStudyFields(item.slug, { image: url })
          } else {
            await saveCaseStudy({
              slug: item.slug,
              client: item.client,
              sector: item.sector,
              title: item.title,
              image: url,
              problem: item.problem,
              solution: item.solution,
              outcome: item.outcome,
              tags: item.tags,
              published: true,
              showOnHome: false,
              homeOrder: 9999,
              sortOrder: 9999,
            })
          }
          uploaded += 1
        } catch (err) {
          failed += 1
          lastErr = formatStorageError(err)
        }
      }
      await publishHomeCaseStudiesSnapshot()
      setMessage(
        `Browser image push → uploaded ${uploaded}, failed ${failed}.${lastErr ? ` Last error: ${lastErr}` : ''} Homepage snapshot republished. If every upload failed, open Firebase Console → Storage → Rules and allow writes to case-studies/{allPaths=**} (or allow read, write: if true while developing).`
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image push failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleImportLocalImage() {
    if (!form.slug.trim() || !form.image.startsWith('/')) {
      setError('Set a slug and a local /images/… path first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const url = await importCaseStudySiteImageToStorage(
        form.slug.trim(),
        form.image.trim()
      )
      if (!url) throw new Error('Could not import local image')
      setForm((p) => ({ ...p, image: url }))
      setMessage('Image imported to Firebase Storage.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'preview') {
    return (
      <AdminCaseStudiesPreviewShell
        slug={previewSlug}
        kind={previewKind}
        onKindChange={setPreviewKind}
        onClose={() => setMode(previewReturn)}
        closeLabel={
          previewReturn === 'list' ? 'Back to list' : 'Back to editor'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Case studies</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Firestore collection <code className="text-xs">caseStudies</code>.
              Homepage first paint uses a published snapshot in{' '}
              <code className="text-xs">Site Content / case-studies-home</code>{' '}
              (one document read). Visitors load more only when they click{' '}
              <strong>Show more</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSeed(false)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
              title="Writes Firestore + homepage snapshot. Keeps /images/cs-*.png paths."
            >
              Seed from archive
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSeed(true)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
              title="Also uploads compressed JPEGs to Storage via the API route"
            >
              Seed + upload images (API)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleBrowserImagePush()}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
              title="Uploads /images/cs-*.png from this browser into Storage"
            >
              Push images from browser
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePublishEmailThumbs()}
              className="rounded-md border border-brand/40 bg-white px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-light disabled:opacity-60"
              title="Compress 6 heroes → Storage email/case-studies/*.jpg for discovery emails"
            >
              Publish email thumbs (Storage)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePublishHome()}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/15 disabled:opacity-60"
            >
              <Home className="h-4 w-4" />
              Publish homepage
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                openPreview(
                  'home',
                  homePreview[0]
                    ? rows.find((r) => r.slug === homePreview[0].slug)
                    : undefined,
                  'list'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              <Eye className="h-4 w-4" />
              Preview homepage
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={startNew}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              New case study
            </button>
          </div>
        </div>

        {(message || error) && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
            role="status"
          >
            {error || message}
          </div>
        )}

        <div className="mt-5 rounded-md border border-border bg-surface-raised p-4">
          <h3 className="text-sm font-semibold text-ink">
            Homepage set ({homePreview.length}/{HOME_CASE_STUDIES_LIMIT})
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Tick <strong>Show on home</strong> on up to four published studies,
            set home order, then click <strong>Publish homepage</strong>.
          </p>
          {homePreview.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">None selected yet.</p>
          ) : (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
              {homePreview.map((cs) => (
                <li key={cs.slug}>
                  <span className="font-medium">{cs.client}</span> — {cs.title}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {mode === 'list' && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">All case studies</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            />
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-ink-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              No case studies yet. Seed from the archive to import the existing
              twelve.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="py-2 pr-3">Client / title</th>
                    <th className="py-2 pr-3">Sector</th>
                    <th className="py-2 pr-3">Home</th>
                    <th className="py-2 pr-3">Order</th>
                    <th className="py-2 pr-3">Published</th>
                    <th className="py-2">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.slug}
                      className="border-b border-border/60 hover:bg-surface-raised"
                    >
                      <td
                        className="cursor-pointer py-2.5 pr-3"
                        onClick={() => startEdit(row)}
                      >
                        <p className="font-medium text-ink">{row.client}</p>
                        <p className="text-xs text-ink-muted">{row.title}</p>
                      </td>
                      <td
                        className="cursor-pointer py-2.5 pr-3 text-ink-muted"
                        onClick={() => startEdit(row)}
                      >
                        {row.sector}
                      </td>
                      <td
                        className="cursor-pointer py-2.5 pr-3"
                        onClick={() => startEdit(row)}
                      >
                        {row.showOnHome ? (
                          <span className="font-semibold text-brand-dark">
                            Yes ({row.homeOrder})
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        className="cursor-pointer py-2.5 pr-3 text-ink-muted"
                        onClick={() => startEdit(row)}
                      >
                        {row.sortOrder}
                      </td>
                      <td
                        className="cursor-pointer py-2.5 pr-3"
                        onClick={() => startEdit(row)}
                      >
                        {row.published ? 'Yes' : 'No'}
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          title="Preview from Firestore"
                          onClick={(e) => {
                            e.stopPropagation()
                            openPreview('card', row)
                          }}
                          className="inline-flex items-center gap-1 rounded border border-border bg-white px-2 py-1 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <form
          onSubmit={(e) => void handleSave(e)}
          className="space-y-4 rounded-lg border border-border bg-surface p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">
              {isNew ? 'New case study' : 'Edit case study'}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {!isNew && form.slug ? (
                <>
                  <button
                    type="button"
                    onClick={() => openPreview('card')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
                  >
                    <Eye className="h-4 w-4" />
                    Preview card
                  </button>
                  <button
                    type="button"
                    onClick={() => openPreview('home')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
                  >
                    <Eye className="h-4 w-4" />
                    Preview homepage
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="text-sm font-semibold text-brand hover:underline"
                onClick={() => setMode('list')}
              >
                Back to list
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((p) => ({
                    ...p,
                    title,
                    slug:
                      isNew && !p.slug
                        ? slugify(`${p.client || 'case'}-${title}`)
                        : p.slug,
                  }))
                }}
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Client</span>
              <input
                required
                value={form.client}
                onChange={(e) =>
                  setForm((p) => ({ ...p, client: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Sector</span>
              <input
                required
                value={form.sector}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sector: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({ ...p, slug: slugify(e.target.value) }))
                }
                className="rounded-md border border-border px-3 py-2 font-mono text-xs"
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
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Image URL or /images/…</span>
              <input
                value={form.image}
                onChange={(e) =>
                  setForm((p) => ({ ...p, image: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2 font-mono text-xs"
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised">
                <Upload className="h-4 w-4" />
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setPendingImageFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleImportLocalImage()}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
              >
                Import local path → Storage
              </button>
              {pendingImageFile && (
                <span className="self-center text-xs text-ink-muted">
                  Pending: {pendingImageFile.name}
                </span>
              )}
            </div>
            {form.image && (
              <div className="relative h-28 w-full overflow-hidden rounded-md border border-border sm:col-span-2">
                <Image
                  src={form.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="600px"
                />
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Problem</span>
              <textarea
                required
                rows={3}
                value={form.problem}
                onChange={(e) =>
                  setForm((p) => ({ ...p, problem: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Solution</span>
              <textarea
                required
                rows={3}
                value={form.solution}
                onChange={(e) =>
                  setForm((p) => ({ ...p, solution: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Outcome</span>
              <textarea
                required
                rows={3}
                value={form.outcome}
                onChange={(e) =>
                  setForm((p) => ({ ...p, outcome: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-ink">
                Tags (comma-separated)
              </span>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="rounded-md border border-border px-3 py-2"
                placeholder="Excel, VBA, SQL DB"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((p) => ({ ...p, published: e.target.checked }))
                }
              />
              Published
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.showOnHome}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    showOnHome: e.target.checked,
                    homeOrder: e.target.checked ? p.homeOrder : 9999,
                  }))
                }
              />
              Show on home (max {HOME_CASE_STUDIES_LIMIT})
            </label>
            {form.showOnHome && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Home order (0–3)</span>
                <input
                  type="number"
                  min={0}
                  max={HOME_CASE_STUDIES_LIMIT - 1}
                  value={form.homeOrder >= 9000 ? 0 : form.homeOrder}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      homeOrder: Number(e.target.value) || 0,
                    }))
                  }
                  className="rounded-md border border-border px-3 py-2"
                />
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            {!isNew && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete()}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
