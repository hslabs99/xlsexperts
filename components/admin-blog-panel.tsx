'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload, Eye, Sparkles, ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react'
import type { BlogPostRecord } from '@/lib/blog-shared'
import { AdminDialog } from '@/components/admin-dialog'
import {
  AdminBlogPreviewShell,
  type BlogPreviewKind,
} from '@/components/admin-blog-preview'
import { AdminBlogAiAssist } from '@/components/admin-blog-ai-assist'
import { BlogImageSizeAdvice } from '@/components/blog-image-size-advice'
import { AdminBlogTextField } from '@/components/admin-blog-text-field'
import {
  assessBlogImage,
  formatBytes,
  infoFromFile,
  BLOG_IMAGE_TARGETS,
} from '@/lib/blog-image-advice'
import type { BlogAiDraft } from '@/lib/blog-ai-types'
import type { BlogSection } from '@/lib/types'
import {
  blogAiAssistSessionHasWork,
  clearBlogAiAssistSession,
  loadBlogAiAssistSession,
} from '@/lib/blog-ai-assist-session'
import {
  describeOptimization,
  fileFromImageUrl,
  optimizeBlogImageFile,
} from '@/lib/blog-image-optimize'

type EditorMode = 'list' | 'edit' | 'preview' | 'ai'
type SortKey =
  | 'order'
  | 'title'
  | 'category'
  | 'author'
  | 'published'
  | 'nz'
  | 'usa'
  | 'featured'
type SortDir = 'asc' | 'desc'
type MarketFilter = 'all' | 'both' | 'nz-only' | 'usa-only' | 'hidden'
type FlagField = 'showNz' | 'showUsa' | 'featured'

function flagSaveKey(slug: string, field: FlagField) {
  return `${slug}:${field}`
}

const SECTION_TYPES: BlogSection['type'][] = [
  'intro',
  'h2',
  'h3',
  'p',
  'ul',
  'faq',
]

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

function SavingCheck({
  checked,
  disabled,
  saving,
  label,
  title,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  saving: boolean
  label: string
  title: string
  onChange: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled || saving}
        onChange={onChange}
        aria-label={label}
        title={title}
      />
      {saving ? (
        <Loader2
          className="h-3.5 w-3.5 animate-spin text-brand"
          aria-label="Saving"
        />
      ) : null}
    </span>
  )
}

function emptyPost(): BlogPostRecord {
  return {
    slug: '',
    title: '',
    author: 'Mike',
    date: new Date().toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    readTime: '5 min read',
    excerpt: '',
    image: '',
    category: 'Guides',
    sections: [{ type: 'p', text: '' }],
    published: true,
    featured: false,
    showNz: true,
    showUsa: true,
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

export function AdminBlogPanel() {
  const [rows, setRows] = useState<BlogPostRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<EditorMode>('list')
  const [previewKind, setPreviewKind] = useState<BlogPreviewKind>('list')
  const [previewReturn, setPreviewReturn] = useState<'list' | 'edit'>('edit')
  const [aiReturn, setAiReturn] = useState<'list' | 'edit'>('list')
  const [aiSessionTick, setAiSessionTick] = useState(0)
  const [form, setForm] = useState<BlogPostRecord>(emptyPost())
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)
  const [imageWarn, setImageWarn] = useState<{
    file: File
    headline: string
    detail: string
  } | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState('')
  const [publishFilter, setPublishFilter] = useState<
    'all' | 'published' | 'draft'
  >('all')
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [savingFlags, setSavingFlags] = useState<Set<string>>(new Set())
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [pendingImagePreviewUrl, setPendingImagePreviewUrl] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!pendingImageFile) {
      setPendingImagePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingImageFile)
    setPendingImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingImageFile])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blogs')
      const data = (await res.json()) as {
        ok?: boolean
        items?: BlogPostRecord[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load blog posts')
      }
      setRows(
        data.items.map((item) => ({
          ...item,
          showNz: item.showNz !== false,
          showUsa: item.showUsa !== false,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (publishFilter === 'published') {
      list = list.filter((r) => r.published)
    } else if (publishFilter === 'draft') {
      list = list.filter((r) => !r.published)
    }
    if (marketFilter === 'both') {
      list = list.filter((r) => r.showNz && r.showUsa)
    } else if (marketFilter === 'nz-only') {
      list = list.filter((r) => r.showNz && !r.showUsa)
    } else if (marketFilter === 'usa-only') {
      list = list.filter((r) => r.showUsa && !r.showNz)
    } else if (marketFilter === 'hidden') {
      list = list.filter((r) => !r.showNz && !r.showUsa)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((r) =>
        [r.title, r.slug, r.category, r.author, r.excerpt]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title, 'en')
          break
        case 'category':
          cmp = a.category.localeCompare(b.category, 'en')
          break
        case 'author':
          cmp = a.author.localeCompare(b.author, 'en')
          break
        case 'published':
          cmp = Number(a.published) - Number(b.published)
          break
        case 'nz':
          cmp = Number(a.showNz) - Number(b.showNz)
          break
        case 'usa':
          cmp = Number(a.showUsa) - Number(b.showUsa)
          break
        case 'featured':
          cmp = Number(a.featured) - Number(b.featured)
          break
        default:
          cmp = a.sortOrder - b.sortOrder
      }
      if (cmp === 0) cmp = a.sortOrder - b.sortOrder
      return cmp * dir
    })
  }, [rows, search, publishFilter, marketFilter, sortKey, sortDir])

  const selectedInView = useMemo(
    () => filtered.filter((r) => selected.has(r.slug)).map((r) => r.slug),
    [filtered, selected]
  )

  const counts = useMemo(() => {
    let published = 0
    let draft = 0
    let both = 0
    let nzOnly = 0
    let usaOnly = 0
    let hidden = 0
    for (const r of rows) {
      if (r.published) published += 1
      else draft += 1
      if (r.showNz && r.showUsa) both += 1
      else if (r.showNz) nzOnly += 1
      else if (r.showUsa) usaOnly += 1
      else hidden += 1
    }
    return { published, draft, total: rows.length, both, nzOnly, usaOnly, hidden }
  }, [rows])

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
    setSelected(new Set(filtered.map((r) => r.slug)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function setPublishedForSlugs(slugs: string[], published: boolean) {
    if (!slugs.length) {
      setError(
        published
          ? 'Select one or more posts to publish.'
          : 'Select one or more posts to unpublish (hide).'
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
        const res = await fetch('/api/admin/blogs', {
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
      // Optimistic local update
      setRows((prev) =>
        prev.map((r) =>
          slugs.includes(r.slug) && !errors.some((e) => e.startsWith(r.slug))
            ? { ...r, published }
            : r
        )
      )
      if (errors.length) {
        setError(
          `Updated ${okCount}/${slugs.length}. Errors: ${errors.slice(0, 3).join('; ')}`
        )
      } else {
        setMessage(
          published
            ? `Published ${okCount} post${okCount === 1 ? '' : 's'}.`
            : `Unpublished (hidden) ${okCount} post${okCount === 1 ? '' : 's'}.`
        )
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch update failed')
    } finally {
      setBusy(false)
    }
  }

  async function toggleOnePublished(post: BlogPostRecord) {
    await setPublishedForSlugs([post.slug], !post.published)
  }

  async function setBooleanFlag(
    slug: string,
    field: FlagField,
    value: boolean
  ) {
    const key = flagSaveKey(slug, field)
    setError(null)
    setMessage(null)
    setSavingFlags((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    setRows((prev) =>
      prev.map((r) => (r.slug === slug ? { ...r, [field]: value } : r))
    )
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, [field]: value }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update post')
      }
    } catch (err) {
      setRows((prev) =>
        prev.map((r) => (r.slug === slug ? { ...r, [field]: !value } : r))
      )
      setError(err instanceof Error ? err.message : 'Failed to update post')
    } finally {
      setSavingFlags((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  function startNew() {
    setIsNew(true)
    setForm(emptyPost())
    setPendingImageFile(null)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function startAiAssist(returnTo: 'list' | 'edit' = 'list') {
    setAiReturn(returnTo)
    setMessage(null)
    setError(null)
    setMode('ai')
  }

  function applyAiDraft(draft: BlogAiDraft | null, imageFile: File | null) {
    clearBlogAiAssistSession()
    setAiSessionTick((n) => n + 1)
    if (draft) {
      setForm({
        ...emptyPost(),
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        category: draft.category,
        author: draft.author || 'Mike',
        readTime: draft.readTime,
        sections:
          draft.sections.length > 0
            ? draft.sections.map((s) => ({ ...s }))
            : [{ type: 'p', text: '' }],
        published: false,
        featured: false,
        showNz: true,
        showUsa: true,
      })
      setIsNew(true)
    } else if (imageFile) {
      setForm(emptyPost())
      setIsNew(true)
    }
    setPendingImageFile(imageFile)
    setAiReturn('edit')
    setMode('edit')
    setMessage(
      draft && imageFile
        ? 'AI draft and image applied — review and save as a draft.'
        : draft
          ? 'AI draft applied — review sections and save as a draft.'
          : 'AI image applied — complete the post and save.'
    )
    setError(null)
  }

  const savedAiSession = useMemo(() => {
    void aiSessionTick
    return loadBlogAiAssistSession()
  }, [aiSessionTick, mode])

  const hasSavedAiWork = blogAiAssistSessionHasWork(savedAiSession)

  function startEdit(post: BlogPostRecord) {
    setIsNew(false)
    setForm({ ...post, sections: post.sections.map((s) => ({ ...s })) })
    setPendingImageFile(null)
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function openPreview(
    kind: BlogPreviewKind,
    post?: BlogPostRecord
  ) {
    if (post) {
      setIsNew(false)
      setForm({ ...post, sections: post.sections.map((s) => ({ ...s })) })
      setPreviewReturn('list')
    } else {
      setPreviewReturn('edit')
    }
    setPreviewKind(kind)
    setMode('preview')
    setMessage(null)
    setError(null)
  }

  function toPublicForm(): BlogPostRecord {
    return {
      ...form,
      slug: form.slug.trim() || slugify(form.title) || 'untitled',
      title: form.title.trim() || 'Untitled post',
    }
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const slug = form.slug.trim() || slugify(form.title)
      if (!slug) throw new Error('Slug (or title) is required.')
      if (!form.title.trim()) throw new Error('Title is required.')
      if (!form.excerpt.trim()) throw new Error('Excerpt is required.')

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug,
          sections: form.sections,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Save failed')
      }
      setIsNew(false)
      setForm((p) => ({ ...p, slug }))

      const queuedImage = pendingImageFile
      if (queuedImage) {
        const optimized = await optimizeBlogImageFile(queuedImage)
        await uploadPendingImage(optimized.file, slug)
        setMessage(
          `Saved “${form.title.trim()}” with optimized hero image (${describeOptimization(optimized)}).`
        )
      } else {
        setMessage(`Saved “${form.title.trim()}”.`)
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteSlug) return
    const slug = deleteSlug
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/blogs?slug=${encodeURIComponent(slug)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Delete failed')
      }
      setMessage(`Deleted ${slug}.`)
      if (form.slug === slug) {
        setMode('list')
        setForm(emptyPost())
      }
      setDeleteSlug(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function uploadPendingImage(file: File, slugOverride?: string) {
    const slug =
      slugOverride?.trim() ||
      form.slug.trim() ||
      slugify(form.title) ||
      'untitled'
    setBusy(true)
    setError(null)
    try {
      const body = new FormData()
      body.set('action', 'upload-image')
      body.set('slug', slug)
      body.set('image', file)
      const res = await fetch('/api/admin/blogs', { method: 'POST', body })
      const data = (await res.json()) as {
        ok?: boolean
        image?: string
        error?: string
        bytes?: number
        originalBytes?: number
      }
      if (!res.ok || !data.ok || !data.image) {
        throw new Error(data.error || 'Image upload failed')
      }
      setForm((p) => ({ ...p, image: data.image!, slug: p.slug || slug }))
      const storedBytes = data.bytes ?? file.size
      const original = data.originalBytes
      setMessage(
        original != null && original > storedBytes
          ? `Image optimized and uploaded (${formatBytes(original)} → ${formatBytes(storedBytes)}).`
          : `Image uploaded (${formatBytes(storedBytes)}).`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
      throw err
    } finally {
      setPendingImageFile(null)
      setImageWarn(null)
      setBusy(false)
    }
  }

  async function optimizeThenUpload(file: File, slugOverride?: string) {
    setBusy(true)
    setError(null)
    try {
      const optimized = await optimizeBlogImageFile(file)
      setPendingImageFile(optimized.file)
      setMessage(describeOptimization(optimized))
      await uploadPendingImage(optimized.file, slugOverride)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Image optimization failed'
      )
      setBusy(false)
    }
  }

  async function handleImageFile(file: File | null) {
    if (!file) return
    setBusy(true)
    setPendingImageFile(file)
    setError(null)
    setImageWarn(null)
    try {
      const optimized = await optimizeBlogImageFile(file)
      setPendingImageFile(optimized.file)
      const info = await infoFromFile(optimized.file)
      const advice = assessBlogImage(info)

      if (advice.level === 'too_large') {
        setImageWarn({
          file: optimized.file,
          headline: advice.headline,
          detail: `${describeOptimization(optimized)} ${advice.detail}`,
        })
        setBusy(false)
        return
      }

      setMessage(describeOptimization(optimized))
      await uploadPendingImage(optimized.file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image handling failed')
      setPendingImageFile(null)
      setBusy(false)
    }
  }

  async function optimizeCurrentHero() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const source =
        pendingImageFile ||
        (form.image.trim() ? await fileFromImageUrl(form.image.trim()) : null)
      if (!source) {
        throw new Error('Choose or upload a hero image first.')
      }
      const optimized = await optimizeBlogImageFile(source)
      setPendingImageFile(optimized.file)
      setImageWarn(null)
      setMessage(describeOptimization(optimized))
      await uploadPendingImage(optimized.file)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not optimize this image'
      )
      setBusy(false)
    }
  }

  function updateSection(index: number, patch: Partial<BlogSection>) {
    setForm((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }

  function addSection(type: BlogSection['type'] = 'p') {
    setForm((p) => ({
      ...p,
      sections: [
        ...p.sections,
        type === 'ul'
          ? { type, items: [''] }
          : type === 'faq'
            ? { type, faqs: [{ q: '', a: '' }] }
            : type === 'h2' || type === 'h3'
              ? { type, heading: '', text: '' }
              : { type, text: '' },
      ],
    }))
  }

  function removeSection(index: number) {
    setForm((p) => ({
      ...p,
      sections: p.sections.filter((_, i) => i !== index),
    }))
  }

  function moveSection(index: number, dir: -1 | 1) {
    setForm((p) => {
      const next = [...p.sections]
      const j = index + dir
      if (j < 0 || j >= next.length) return p
      ;[next[index], next[j]] = [next[j], next[index]]
      return { ...p, sections: next }
    })
  }

  if (mode === 'preview') {
    const previewPost = toPublicForm()
    return (
      <AdminBlogPreviewShell
        post={previewPost}
        kind={previewKind}
        onKindChange={setPreviewKind}
        onClose={() => setMode(previewReturn)}
        closeLabel={
          previewReturn === 'list' ? 'Back to list' : 'Back to editor'
        }
      />
    )
  }

  if (mode === 'ai') {
    return (
      <div className="space-y-6">
        <AdminBlogAiAssist
          onApply={applyAiDraft}
          onCancel={() => {
            setAiSessionTick((n) => n + 1)
            setMode(aiReturn)
          }}
          cancelLabel={
            aiReturn === 'edit' ? 'Back to editor' : 'Back to list'
          }
        />
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {isNew ? 'New blog post' : 'Edit blog post'}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Content is stored in Firebase <code className="text-xs">blogPosts</code>.
              Images upload to Firebase Storage. Public layout is unchanged.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => startAiAssist('edit')}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/15"
            >
              <Sparkles className="h-4 w-4" />
              AI Assist &amp; prompts
            </button>
            <button
              type="button"
              onClick={() => openPreview('list')}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              <Eye className="h-4 w-4" />
              Preview list
            </button>
            <button
              type="button"
              onClick={() => openPreview('article')}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              <Eye className="h-4 w-4" />
              Preview article
            </button>
            <button
              type="button"
              onClick={() => setMode('list')}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              Back to list
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
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-3 rounded-lg border border-border bg-surface p-5 lg:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm lg:col-span-2">
            <span className="font-medium text-ink">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value
                setForm((p) => ({
                  ...p,
                  title,
                  slug: isNew && !p.slug ? slugify(title) : p.slug,
                }))
              }}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Slug</span>
            <input
              required
              value={form.slug}
              disabled={!isNew}
              onChange={(e) =>
                setForm((p) => ({ ...p, slug: slugify(e.target.value) }))
              }
              className="rounded-md border border-border px-3 py-2 font-mono text-xs disabled:bg-surface-raised"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Category</span>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Author</span>
            <input
              value={form.author}
              onChange={(e) =>
                setForm((p) => ({ ...p, author: e.target.value }))
              }
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Date (display)</span>
            <input
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="rounded-md border border-border px-3 py-2"
              placeholder="July 13, 2025"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Read time</span>
            <input
              value={form.readTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, readTime: e.target.value }))
              }
              className="rounded-md border border-border px-3 py-2"
              placeholder="5 min read"
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
          <label className="flex flex-col gap-1 text-sm lg:col-span-2">
            <span className="font-medium text-ink">Excerpt</span>
            <textarea
              required
              rows={3}
              value={form.excerpt}
              onChange={(e) =>
                setForm((p) => ({ ...p, excerpt: e.target.value }))
              }
              className="rounded-md border border-border px-3 py-2"
            />
          </label>

          <div className="lg:col-span-2 space-y-3 rounded-md border border-border bg-surface-raised p-4">
            <div>
              <p className="text-sm font-medium text-ink">Hero image</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Images are automatically optimized for phones (about 1600px
                wide, under {formatBytes(BLOG_IMAGE_TARGETS.idealMaxBytes)},
                WebP/JPEG). Large files are never uploaded as-is.
              </p>
            </div>
            {form.image || pendingImagePreviewUrl ? (
              <div className="relative h-40 w-full max-w-md overflow-hidden rounded border border-border bg-white">
                <Image
                  src={pendingImagePreviewUrl || form.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                  unoptimized
                />
              </div>
            ) : null}
            {pendingImageFile && !form.image ? (
              <p className="text-xs text-ink-muted">
                Pending AI image: {pendingImageFile.name} (uploads on save)
              </p>
            ) : null}
            <BlogImageSizeAdvice
              imageUrl={form.image}
              pendingFile={pendingImageFile}
            />
            <input
              value={form.image}
              onChange={(e) => {
                setPendingImageFile(null)
                setForm((p) => ({ ...p, image: e.target.value }))
              }}
              placeholder="/images/blog-....png or Storage URL"
              className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised">
                <Upload className="h-4 w-4" />
                Choose image…
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) =>
                    void handleImageFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <button
                type="button"
                disabled={busy || (!pendingImageFile && !form.image.trim())}
                onClick={() => void optimizeCurrentHero()}
                className="inline-flex items-center gap-2 rounded-md border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/15 disabled:opacity-60"
              >
                Optimize for web
              </button>
            </div>
          </div>

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
              checked={form.featured}
              onChange={(e) =>
                setForm((p) => ({ ...p, featured: e.target.checked }))
              }
            />
            Featured (list page hero)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.showNz}
              onChange={(e) =>
                setForm((p) => ({ ...p, showNz: e.target.checked }))
              }
            />
            Show on NZ site
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.showUsa}
              onChange={(e) =>
                setForm((p) => ({ ...p, showUsa: e.target.checked }))
              }
            />
            Show on USA site
          </label>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">
              Sections ({form.sections.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addSection(t)}
                  className="rounded border border-border bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-4 space-y-4">
            {form.sections.map((section, index) => (
              <li
                key={`${section.type}-${index}`}
                className="rounded-md border border-border bg-surface-raised p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={section.type}
                    onChange={(e) =>
                      updateSection(index, {
                        type: e.target.value as BlogSection['type'],
                      })
                    }
                    className="rounded border border-border bg-white px-2 py-1 text-xs font-semibold uppercase"
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(index, -1)}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 1)}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {(section.type === 'h2' || section.type === 'h3') && (
                  <input
                    value={section.heading ?? ''}
                    onChange={(e) =>
                      updateSection(index, { heading: e.target.value })
                    }
                    placeholder="Heading"
                    className="mt-3 w-full rounded-md border border-border px-3 py-2 text-sm"
                  />
                )}

                {(section.type === 'h2' ||
                  section.type === 'h3' ||
                  section.type === 'p' ||
                  section.type === 'intro') && (
                  <AdminBlogTextField
                    value={section.text ?? ''}
                    onChange={(text) => updateSection(index, { text })}
                    placeholder="Text"
                    rows={4}
                  />
                )}

                {section.type === 'ul' && (
                  <AdminBlogTextField
                    value={(section.items ?? []).join('\n')}
                    onChange={(raw) =>
                      updateSection(index, {
                        items: raw
                          .split('\n')
                          .map((line) => line.trimEnd())
                          .filter((line, i, arr) =>
                            i === arr.length - 1 ? true : line.length > 0
                          ),
                      })
                    }
                    placeholder="One list item per line"
                    rows={5}
                    className="mt-0 w-full rounded-md border border-border px-3 py-2 font-mono text-xs"
                  />
                )}

                {section.type === 'faq' && (
                  <div className="mt-3 space-y-3">
                    {(section.faqs ?? []).map((faq, fi) => (
                      <div
                        key={fi}
                        className="rounded border border-border bg-white p-3"
                      >
                        <input
                          value={faq.q}
                          onChange={(e) => {
                            const faqs = [...(section.faqs ?? [])]
                            faqs[fi] = { ...faqs[fi], q: e.target.value }
                            updateSection(index, { faqs })
                          }}
                          placeholder="Question"
                          className="w-full rounded border border-border px-2 py-1.5 text-sm"
                        />
                        <AdminBlogTextField
                          value={faq.a}
                          onChange={(a) => {
                            const faqs = [...(section.faqs ?? [])]
                            faqs[fi] = { ...faqs[fi], a }
                            updateSection(index, { faqs })
                          }}
                          placeholder="Answer"
                          rows={3}
                          className="mt-0 w-full rounded border border-border px-2 py-1.5 text-sm"
                        />
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-red-700"
                          onClick={() => {
                            const faqs = (section.faqs ?? []).filter(
                              (_, i) => i !== fi
                            )
                            updateSection(index, { faqs })
                          }}
                        >
                          Remove FAQ
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(index, {
                          faqs: [...(section.faqs ?? []), { q: '', a: '' }],
                        })
                      }
                      className="text-xs font-semibold text-brand"
                    >
                      + Add FAQ pair
                    </button>
                  </div>
                )}

                <div className="mt-3 flex justify-end border-t border-border pt-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSave()}
                    className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openPreview('list')}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <Eye className="h-4 w-4" />
            Preview list
          </button>
          <button
            type="button"
            onClick={() => openPreview('article')}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <Eye className="h-4 w-4" />
            Preview article
          </button>
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
              onClick={() => setDeleteSlug(form.slug)}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Blog posts</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Live posts in Firebase <code className="text-xs">blogPosts</code>.
              Use <strong>New with AI</strong> to draft markdown copy and a hero
              image from a system prompt library, or create manually. Filter
              drafts vs published, select rows, then batch publish or unpublish
              (hide from the public blog). NZ and USA checkboxes default to both
              sites; uncheck one to hide a regional post from the other market.
              Use the market filters or click column headers to isolate NZ-only
              or USA-only posts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => startAiAssist('list')}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/15 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              New with AI
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={startNew}
              className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              New post
            </button>
          </div>
        </div>

        {hasSavedAiWork && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand/30 bg-brand-light p-3 text-sm text-brand-dark">
            <p>
              You have in-progress AI Assist work saved in this browser session
              {savedAiSession?.title
                ? ` (“${savedAiSession.title}”)`
                : ''}
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startAiAssist('list')}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Resume AI Assist
              </button>
              <button
                type="button"
                onClick={() => {
                  clearBlogAiAssistSession()
                  setAiSessionTick((n) => n + 1)
                }}
                className="rounded-md border border-brand/40 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/10"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {(message || error) && (
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

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, slug, category, author…"
            className="w-full max-w-md rounded-md border border-border px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-xs text-ink-muted">Show:</span>
            {(
              [
                { id: 'all', label: `All (${counts.total})` },
                { id: 'published', label: `Published (${counts.published})` },
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
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-xs text-ink-muted">Market:</span>
            {(
              [
                { id: 'all', label: `All (${counts.total})` },
                { id: 'both', label: `Both (${counts.both})` },
                { id: 'nz-only', label: `NZ only (${counts.nzOnly})` },
                { id: 'usa-only', label: `USA only (${counts.usaOnly})` },
                { id: 'hidden', label: `Hidden (${counts.hidden})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={busy}
                onClick={() => setMarketFilter(opt.id)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                  marketFilter === opt.id
                    ? 'border-brand bg-brand-light text-brand-dark'
                    : 'border-border bg-white text-ink-muted hover:bg-surface-raised'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy || filtered.length === 0}
            onClick={selectAllFiltered}
            className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
          >
            Select filtered ({filtered.length})
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
          Showing {filtered.length} of {rows.length} posts
          {selectedInView.length > 0
            ? ` · ${selectedInView.length} selected`
            : ''}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                <th className="py-2 pr-2 w-8">
                  <span className="sr-only">Select</span>
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
                    onClick={() => toggleSort('title')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Title
                    <SortIcon active={sortKey === 'title'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('category')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Category
                    <SortIcon active={sortKey === 'category'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('author')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Author
                    <SortIcon active={sortKey === 'author'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('published')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Published
                    <SortIcon active={sortKey === 'published'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('nz')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    NZ
                    <SortIcon active={sortKey === 'nz'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('usa')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    USA
                    <SortIcon active={sortKey === 'usa'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('featured')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Featured
                    <SortIcon active={sortKey === 'featured'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-6 text-ink-muted">
                    Loading from Firebase…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-ink-muted">
                    {rows.length === 0
                      ? 'No posts in Firebase yet. Add a new post to get started.'
                      : 'No posts match this filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.slug} className="border-b border-border/70">
                    <td className="py-2.5 pr-2">
                      <input
                        type="checkbox"
                        checked={selected.has(post.slug)}
                        disabled={busy}
                        onChange={() => toggleSelected(post.slug)}
                        aria-label={`Select ${post.title}`}
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-ink-muted">
                      {post.sortOrder}
                    </td>
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        className="text-left font-medium text-brand hover:underline"
                        onClick={() => startEdit(post)}
                      >
                        {post.title}
                      </button>
                      <div className="font-mono text-[11px] text-ink-muted">
                        {post.slug}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">{post.category}</td>
                    <td className="py-2.5 pr-3">{post.author}</td>
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void toggleOnePublished(post)}
                        className={`rounded px-2 py-0.5 text-xs font-semibold disabled:opacity-60 ${
                          post.published
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                        }`}
                        title={
                          post.published
                            ? 'Click to unpublish (hide from public blog)'
                            : 'Click to publish (show on public blog)'
                        }
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-2.5 pr-3">
                      <SavingCheck
                        checked={post.showNz}
                        disabled={busy}
                        saving={savingFlags.has(flagSaveKey(post.slug, 'showNz'))}
                        label={`Show ${post.title} on NZ site`}
                        title="Show on New Zealand site"
                        onChange={() =>
                          void setBooleanFlag(post.slug, 'showNz', !post.showNz)
                        }
                      />
                    </td>
                    <td className="py-2.5 pr-3">
                      <SavingCheck
                        checked={post.showUsa}
                        disabled={busy}
                        saving={savingFlags.has(flagSaveKey(post.slug, 'showUsa'))}
                        label={`Show ${post.title} on USA site`}
                        title="Show on USA site"
                        onChange={() =>
                          void setBooleanFlag(
                            post.slug,
                            'showUsa',
                            !post.showUsa
                          )
                        }
                      />
                    </td>
                    <td className="py-2.5 pr-3">
                      <SavingCheck
                        checked={post.featured}
                        disabled={busy}
                        saving={savingFlags.has(
                          flagSaveKey(post.slug, 'featured')
                        )}
                        label={`Feature ${post.title} on the list page`}
                        title="Featured (list page hero)"
                        onChange={() =>
                          void setBooleanFlag(
                            post.slug,
                            'featured',
                            !post.featured
                          )
                        }
                      />
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(post)}
                          className="rounded border border-border px-2 py-1 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openPreview('list', post)}
                          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs font-semibold"
                        >
                          <Eye className="h-3 w-3" />
                          List
                        </button>
                        <button
                          type="button"
                          onClick={() => openPreview('article', post)}
                          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs font-semibold"
                        >
                          <Eye className="h-3 w-3" />
                          Article
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setDeleteSlug(post.slug)}
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                        >
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
      </div>

      <AdminDialog
        open={deleteSlug != null}
        title="Delete blog post?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete post"
        busy={busy}
        onClose={() => {
          if (!busy) setDeleteSlug(null)
        }}
        onConfirm={confirmDelete}
      >
        <p>
          Delete blog post “{deleteSlug}” from Firebase? This cannot be undone.
        </p>
      </AdminDialog>

      <AdminDialog
        open={imageWarn != null}
        title={imageWarn?.headline || 'Large image'}
        mode="confirm"
        confirmLabel="Optimize & upload"
        cancelLabel="Cancel"
        busy={busy}
        onClose={() => {
          if (!busy) {
            setImageWarn(null)
            setPendingImageFile(null)
          }
        }}
        onConfirm={async () => {
          if (!imageWarn) return
          await optimizeThenUpload(imageWarn.file)
        }}
      >
        <p>{imageWarn?.detail}</p>
        <p>
          We will compress this to under about{' '}
          {formatBytes(BLOG_IMAGE_TARGETS.idealMaxBytes)} before it goes live —
          visitors never receive the original large file.
        </p>
      </AdminDialog>
    </div>
  )
}
