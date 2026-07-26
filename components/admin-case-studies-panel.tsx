'use client'

import { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import Image from 'next/image'
import {
  Plus,
  Trash2,
  Upload,
  Home,
  Eye,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react'
import {
  HOME_CASE_STUDIES_LIMIT,
  selectHomeCaseStudies,
  type CaseStudyRecord,
} from '@/lib/case-studies-shared'
import { prepareCaseStudyImageUpload } from '@/lib/case-studies-storage'
import { AdminDialog } from '@/components/admin-dialog'
import {
  AdminCaseStudiesPreviewShell,
  type CaseStudyPreviewKind,
} from '@/components/admin-case-studies-preview'
import { AdminCaseStudyAiAssist } from '@/components/admin-case-study-ai-assist'
import type { CaseStudyAiDraft } from '@/lib/case-study-ai-types'
import type { CaseStudy } from '@/lib/types'
import { servicePages } from '@/lib/service-pages'
import { solutionPages } from '@/lib/solutions'

type EditorMode = 'list' | 'edit' | 'preview' | 'ai'

type SortKey = 'client' | 'sector' | 'home' | 'order' | 'published'
type SortDir = 'asc' | 'desc'
type PublishFilter = 'all' | 'published' | 'draft'

function SortIcon({
  active,
  dir,
}: {
  active: boolean
  dir: SortDir
}) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
  return dir === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-brand" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-brand" />
  )
}

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
    serviceSlugs: [],
    solutionSlugs: [],
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

function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
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
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tagsText, setTagsText] = useState('')
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [previewKind, setPreviewKind] = useState<CaseStudyPreviewKind>('card')
  const [previewSlug, setPreviewSlug] = useState('')
  const [previewReturn, setPreviewReturn] = useState<'list' | 'edit'>('list')
  const [previewDraft, setPreviewDraft] = useState<CaseStudy | null>(null)
  const [previewDraftMeta, setPreviewDraftMeta] = useState<{
    published: boolean
    showOnHome: boolean
    homeOrder: number
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/case-studies')
      const data = (await res.json()) as {
        ok?: boolean
        items?: CaseStudyRecord[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load case studies')
      }
      setRows(data.items)
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

  useEffect(() => {
    if (!pendingImageFile) {
      setPendingPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingImageFile)
    setPendingPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingImageFile])

  const filteredSorted = useMemo(() => {
    let list = rows
    if (publishFilter === 'published') {
      list = list.filter((r) => r.published)
    } else if (publishFilter === 'draft') {
      list = list.filter((r) => !r.published)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((r) =>
        [r.title, r.client, r.sector, r.slug]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }

    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'client':
          cmp =
            a.client.localeCompare(b.client) || a.title.localeCompare(b.title)
          break
        case 'sector':
          cmp = a.sector.localeCompare(b.sector)
          break
        case 'home':
          cmp =
            Number(a.showOnHome) - Number(b.showOnHome) ||
            a.homeOrder - b.homeOrder
          break
        case 'order':
          cmp = a.sortOrder - b.sortOrder
          break
        case 'published':
          cmp = Number(a.published) - Number(b.published)
          break
      }
      return cmp * dir
    })
  }, [rows, search, publishFilter, sortKey, sortDir])

  const selectedInView = useMemo(
    () =>
      filteredSorted.filter((r) => selected.has(r.slug)).map((r) => r.slug),
    [filteredSorted, selected]
  )

  const counts = useMemo(() => {
    let published = 0
    let draft = 0
    for (const r of rows) {
      if (r.published) published += 1
      else draft += 1
    }
    return { published, draft, total: rows.length }
  }, [rows])

  const allFilteredSelected =
    filteredSorted.length > 0 &&
    filteredSorted.every((r) => selected.has(r.slug))

  const homePreview = useMemo(() => selectHomeCaseStudies(rows), [rows])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggleSelected(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function selectAllFiltered() {
    setSelected(new Set(filteredSorted.map((r) => r.slug)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) clearSelection()
    else selectAllFiltered()
  }

  async function setPublishedForSlugs(slugs: string[], published: boolean) {
    if (!slugs.length) {
      setError(
        published
          ? 'Select one or more case studies to publish.'
          : 'Select one or more case studies to unpublish.'
      )
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      let okCount = 0
      const errors: string[] = []
      for (const slug of slugs) {
        const res = await fetch('/api/admin/case-studies', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, published }),
        })
        const data = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || !data.ok) {
          errors.push(`${slug}: ${data.error || 'failed'}`)
        } else {
          okCount += 1
        }
      }
      setRows((prev) =>
        prev.map((r) =>
          slugs.includes(r.slug) && !errors.some((e) => e.startsWith(r.slug))
            ? { ...r, published }
            : r
        )
      )
      if (errors.length) {
        setError(
          `Updated ${okCount}, failed ${errors.length}: ${errors.slice(0, 3).join('; ')}`
        )
      } else {
        setMessage(
          published
            ? `Published ${okCount} case stud${okCount === 1 ? 'y' : 'ies'}.`
            : `Unpublished ${okCount} case stud${okCount === 1 ? 'y' : 'ies'}.`
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update published status'
      )
    } finally {
      setBusy(false)
    }
  }

  function startNew() {
    setForm(emptyRecord())
    setTagsText('')
    setPendingImageFile(null)
    setIsNew(true)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function startAiAssist() {
    setMessage(null)
    setError(null)
    setMode('ai')
  }

  function applyAiDraft(
    draft: CaseStudyAiDraft | null,
    imageFile: File | null
  ) {
    if (draft) {
      setForm({
        ...emptyRecord(),
        title: draft.title,
        client: draft.client,
        sector: draft.sector,
        slug: draft.slug,
        problem: draft.problem,
        solution: draft.solution,
        outcome: draft.outcome,
        tags: draft.tags,
        serviceSlugs: draft.serviceSlugs,
        solutionSlugs: draft.solutionSlugs,
        published: false,
      })
      setTagsText(draft.tags.join(', '))
      setIsNew(true)
    } else if (imageFile) {
      // Image-only: open a blank editor with the pending image queued
      setForm(emptyRecord())
      setTagsText('')
      setIsNew(true)
    }
    if (imageFile) {
      setPendingImageFile(imageFile)
    }
    setMode('edit')
    const parts: string[] = []
    if (draft) parts.push('copy')
    if (imageFile) parts.push('image')
    setMessage(
      `AI ${parts.join(' and ')} applied. Review fields, then Save. You can preview after saving without leaving the editor.`
    )
    setError(null)
  }

  function toggleSlug(
    field: 'serviceSlugs' | 'solutionSlugs',
    slug: string
  ) {
    setForm((prev) => {
      const current = prev[field] ?? []
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug]
      return { ...prev, [field]: next }
    })
  }

  async function toggleRowLink(
    row: CaseStudyRecord,
    field: 'serviceSlugs' | 'solutionSlugs',
    slug: string
  ) {
    const current = row[field] ?? []
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug]

    setRows((prev) =>
      prev.map((r) => (r.slug === row.slug ? { ...r, [field]: next } : r))
    )
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/case-studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: row.slug, [field]: next }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.slug === row.slug ? { ...r, [field]: current } : r
          )
        )
        throw new Error(data.error || 'Could not update links')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update links'
      )
    } finally {
      setBusy(false)
    }
  }

  function startEdit(row: CaseStudyRecord) {
    setForm({
      ...row,
      tags: [...row.tags],
      serviceSlugs: [...(row.serviceSlugs ?? [])],
      solutionSlugs: [...(row.solutionSlugs ?? [])],
    })
    setTagsText(row.tags.join(', '))
    setPendingImageFile(null)
    setIsNew(false)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function buildEditorDraftPreview(): CaseStudy {
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    return {
      slug: form.slug.trim() || 'draft',
      client: form.client.trim() || 'Client',
      sector: form.sector.trim() || 'Sector',
      title: form.title.trim() || 'Untitled case study',
      image: pendingPreviewUrl || form.image.trim(),
      problem: form.problem,
      solution: form.solution,
      outcome: form.outcome,
      tags,
      serviceSlugs: form.serviceSlugs ?? [],
      solutionSlugs: form.solutionSlugs ?? [],
    }
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

    // Only load a list row into the form when leaving the list — never
    // overwrite an in-progress editor when returning to it after preview.
    if (row && returnTo === 'list') {
      setIsNew(false)
      setForm({
        ...row,
        tags: [...row.tags],
        serviceSlugs: [...(row.serviceSlugs ?? [])],
        solutionSlugs: [...(row.solutionSlugs ?? [])],
      })
      setTagsText(row.tags.join(', '))
      setPendingImageFile(null)
    }

    // From the editor: always pass the live draft so Preview never depends
    // on a saved Firestore slug.
    if (returnTo === 'edit') {
      setPreviewDraft(buildEditorDraftPreview())
      setPreviewDraftMeta({
        published: form.published,
        showOnHome: form.showOnHome,
        homeOrder: form.homeOrder,
      })
    } else if (row) {
      setPreviewDraft(null)
      setPreviewDraftMeta(null)
    } else {
      setPreviewDraft(null)
      setPreviewDraftMeta(null)
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
      const slug =
        slugify(form.slug) || slugify(`${form.client}-${form.title}`)
      if (!slug) throw new Error('Slug is required')
      if (!form.title.trim()) throw new Error('Title is required')

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
        image: form.image.trim(),
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        serviceSlugs: form.serviceSlugs ?? [],
        solutionSlugs: form.solutionSlugs ?? [],
        showOnHome: homeOn,
        homeOrder: homeOn
          ? typeof form.homeOrder === 'number' && form.homeOrder < 9000
            ? form.homeOrder
            : homeAlready
          : 9999,
      }

      let res: Response
      if (pendingImageFile) {
        const preparedImage = await prepareCaseStudyImageUpload(pendingImageFile)
        const requestBody = new FormData()
        requestBody.set('payload', JSON.stringify(payload))
        requestBody.set('image', preparedImage)
        res = await fetch('/api/admin/case-studies', {
          method: 'POST',
          body: requestBody,
        })
      } else {
        res = await fetch('/api/admin/case-studies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const data = (await res.json()) as {
        ok?: boolean
        image?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Save failed')
      }
      const savedImage =
        typeof data.image === 'string' && data.image.trim()
          ? data.image.trim()
          : payload.image
      setForm({
        ...payload,
        image: savedImage,
        tags: [...payload.tags],
        serviceSlugs: [...payload.serviceSlugs],
        solutionSlugs: [...payload.solutionSlugs],
      })
      setTagsText(payload.tags.join(', '))
      setPendingImageFile(null)
      setIsNew(false)
      setMessage(
        'Case study saved. You can keep editing, or use Preview without losing your place.'
      )
      await load()
      setMode('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!form.slug || isNew) return
    setConfirmDelete(true)
  }

  async function confirmDeleteCaseStudy() {
    if (!form.slug || isNew) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/case-studies?slug=${encodeURIComponent(form.slug)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Delete failed')
      }
      setMessage('Case study deleted.')
      setConfirmDelete(false)
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
      const res = await fetch('/api/admin/case-studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish-home' }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        items?: unknown[]
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to publish homepage snapshot')
      }
      const count = data.items?.length ?? 0
      setMessage(
        `Homepage snapshot published (${count} card${count === 1 ? '' : 's'}). Public site reads this document only — no live collection query on first paint.`
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to publish homepage snapshot'
      )
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
      const response = await fetch(form.image.trim())
      if (!response.ok) throw new Error('Could not read local image')
      const blob = await response.blob()
      const filename =
        form.image.split('/').pop()?.split('?')[0] || 'case-study-image.png'
      setPendingImageFile(
        new File([blob], filename, { type: blob.type || 'image/png' })
      )
      setMessage('Local image queued. Save the case study to upload it.')
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
        draft={previewDraft}
        draftMeta={previewDraftMeta}
      />
    )
  }

  if (mode === 'ai') {
    return (
      <div className="space-y-6">
        <AdminCaseStudyAiAssist
          onApply={applyAiDraft}
          onCancel={() => setMode('list')}
        />
      </div>
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
              Use <strong>AI Assist</strong> to draft copy and images from a
              short brief, or create manually. Tag studies to services and
              solutions for page linking. Homepage first paint uses a published
              snapshot in{' '}
              <code className="text-xs">Site Content / case-studies-home</code>{' '}
              (one document read). Visitors load more only when they click{' '}
              <strong>Show more</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
                  undefined,
                  mode === 'edit' ? 'edit' : 'list'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              <Eye className="h-4 w-4" />
              Preview homepage
            </button>
            {mode === 'list' ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={startAiAssist}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/15 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Assist
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
              </>
            ) : null}
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

          <div className="mt-3 flex flex-wrap items-center gap-1">
            <span className="mr-1 text-xs text-ink-muted">Show:</span>
            {(
              [
                { id: 'all', label: `All (${counts.total})` },
                {
                  id: 'published',
                  label: `Published (${counts.published})`,
                },
                { id: 'draft', label: `Drafts (${counts.draft})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={busy}
                onClick={() => setPublishFilter(opt.id)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                  publishFilter === opt.id
                    ? 'border-brand bg-brand-light text-brand-dark'
                    : 'border-border bg-white text-ink-muted hover:bg-surface-raised'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || filteredSorted.length === 0}
              onClick={selectAllFiltered}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Select filtered ({filteredSorted.length})
            </button>
            <button
              type="button"
              disabled={busy || selected.size === 0}
              onClick={clearSelection}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Clear selection
            </button>
            <button
              type="button"
              disabled={busy || selectedInView.length === 0}
              onClick={() => void setPublishedForSlugs(selectedInView, true)}
              className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
            >
              Publish selected ({selectedInView.length})
            </button>
            <button
              type="button"
              disabled={busy || selectedInView.length === 0}
              onClick={() => void setPublishedForSlugs(selectedInView, false)}
              className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
            >
              Unpublish selected ({selectedInView.length})
            </button>
          </div>

          <p className="mt-3 text-xs text-ink-muted">
            Showing {filteredSorted.length} of {rows.length}{' '}
            {rows.length === 1 ? 'case study' : 'case studies'}
            {selectedInView.length > 0
              ? ` · ${selectedInView.length} selected`
              : ''}
            . Click column headers to sort. Click Services / Solutions tags to
            link or unlink pages.
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-ink-muted">Loading…</p>
          ) : filteredSorted.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              {rows.length === 0
                ? 'No case studies yet. Add a new case study to get started.'
                : 'No case studies match this filter.'}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="w-8 py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        disabled={busy || filteredSorted.length === 0}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Select all filtered case studies"
                      />
                    </th>
                    <th className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('client')}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        Client / title
                        <SortIcon
                          active={sortKey === 'client'}
                          dir={sortDir}
                        />
                      </button>
                    </th>
                    <th className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('sector')}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        Sector
                        <SortIcon
                          active={sortKey === 'sector'}
                          dir={sortDir}
                        />
                      </button>
                    </th>
                    <th className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('home')}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        Home
                        <SortIcon active={sortKey === 'home'} dir={sortDir} />
                      </button>
                    </th>
                    <th className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('order')}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        Order
                        <SortIcon active={sortKey === 'order'} dir={sortDir} />
                      </button>
                    </th>
                    <th className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('published')}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        Published
                        <SortIcon
                          active={sortKey === 'published'}
                          dir={sortDir}
                        />
                      </button>
                    </th>
                    <th className="py-2">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSorted.map((row) => {
                    const serviceSet = new Set(row.serviceSlugs ?? [])
                    const solutionSet = new Set(row.solutionSlugs ?? [])
                    const rowTone = row.published
                      ? 'bg-emerald-50/80'
                      : 'opacity-60'
                    return (
                      <Fragment key={row.slug}>
                        <tr
                          className={`border-b border-border/40 hover:bg-surface-raised ${rowTone}`}
                        >
                          <td className="py-2.5 pr-2">
                            <input
                              type="checkbox"
                              checked={selected.has(row.slug)}
                              disabled={busy}
                              onChange={() => toggleSelected(row.slug)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${row.title || row.client}`}
                            />
                          </td>
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
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                row.published
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-50 text-amber-900'
                              }`}
                            >
                              {row.published ? 'Yes' : 'No'}
                            </span>
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
                        <tr
                          className={`border-b border-border/60 ${rowTone}`}
                        >
                          <td colSpan={7} className="px-2 pb-3 pt-0">
                            <div className="ml-6 space-y-2 rounded-md border border-border/70 bg-white/70 px-3 py-2">
                              <div className="flex flex-wrap items-start gap-x-2 gap-y-1.5">
                                <span className="mt-0.5 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                                  Services
                                </span>
                                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                  {servicePages.map((s) => {
                                    const slug = s.href.replace(/^\//, '')
                                    const on = serviceSet.has(slug)
                                    return (
                                      <button
                                        key={s.href}
                                        type="button"
                                        disabled={busy}
                                        title={
                                          on
                                            ? `Remove from ${s.label}`
                                            : `Link to ${s.label}`
                                        }
                                        onClick={() =>
                                          void toggleRowLink(
                                            row,
                                            'serviceSlugs',
                                            slug
                                          )
                                        }
                                        className={`rounded border px-1.5 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-60 ${
                                          on
                                            ? 'border-brand/40 bg-brand-light text-brand-dark'
                                            : 'border-border bg-white text-ink-muted hover:border-brand/30 hover:text-ink'
                                        }`}
                                      >
                                        {s.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-start gap-x-2 gap-y-1.5">
                                <span className="mt-0.5 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                                  Solutions
                                </span>
                                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                  {solutionPages.map((s) => {
                                    const on = solutionSet.has(s.slug)
                                    return (
                                      <button
                                        key={s.slug}
                                        type="button"
                                        disabled={busy}
                                        title={
                                          on
                                            ? `Remove from ${s.title}`
                                            : `Link to ${s.title}`
                                        }
                                        onClick={() =>
                                          void toggleRowLink(
                                            row,
                                            'solutionSlugs',
                                            s.slug
                                          )
                                        }
                                        className={`rounded border px-1.5 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-60 ${
                                          on
                                            ? 'border-brand/40 bg-brand-light text-brand-dark'
                                            : 'border-border bg-white text-ink-muted hover:border-brand/30 hover:text-ink'
                                        }`}
                                      >
                                        {s.shortTitle}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    )
                  })}
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
              <button
                type="button"
                onClick={() => openPreview('card', undefined, 'edit')}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
              >
                <Eye className="h-4 w-4" />
                Preview card
              </button>
              <button
                type="button"
                onClick={() => openPreview('home', undefined, 'edit')}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
              >
                <Eye className="h-4 w-4" />
                Preview homepage
              </button>
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
                  setForm((p) => ({
                    ...p,
                    slug: sanitizeSlugInput(e.target.value),
                  }))
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
                Upload image (900 × 300)
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
            {(pendingPreviewUrl || form.image) && (
              <div className="relative h-28 w-full overflow-hidden rounded-md border border-border sm:col-span-2">
                <Image
                  src={pendingPreviewUrl || form.image}
                  alt=""
                  fill
                  unoptimized={Boolean(pendingPreviewUrl)}
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

            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium text-ink">
                Linked solutions
              </legend>
              <p className="mt-1 text-xs text-ink-muted">
                Used to surface this study on Solutions pages.
              </p>
              <div className="mt-2 grid max-h-48 gap-1.5 overflow-y-auto rounded-md border border-border bg-surface-raised p-3 sm:grid-cols-2">
                {solutionPages.map((s) => {
                  const checked = (form.solutionSlugs ?? []).includes(s.slug)
                  return (
                    <label
                      key={s.slug}
                      className="inline-flex items-start gap-2 text-xs text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSlug('solutionSlugs', s.slug)}
                        className="mt-0.5"
                      />
                      <span>{s.title}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium text-ink">
                Linked services
              </legend>
              <p className="mt-1 text-xs text-ink-muted">
                Service path tags (without leading slash).
              </p>
              <div className="mt-2 grid max-h-48 gap-1.5 overflow-y-auto rounded-md border border-border bg-surface-raised p-3 sm:grid-cols-2">
                {servicePages.map((s) => {
                  const slug = s.href.replace(/^\//, '')
                  const checked = (form.serviceSlugs ?? []).includes(slug)
                  return (
                    <label
                      key={s.href}
                      className="inline-flex items-start gap-2 text-xs text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSlug('serviceSlugs', slug)}
                        className="mt-0.5"
                      />
                      <span>{s.label}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

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

      <AdminDialog
        open={confirmDelete}
        title="Delete case study?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete"
        busy={busy}
        onClose={() => {
          if (!busy) setConfirmDelete(false)
        }}
        onConfirm={confirmDeleteCaseStudy}
      >
        <p>
          Delete “{form.title || form.slug}”? This cannot be undone.
        </p>
      </AdminDialog>
    </div>
  )
}
