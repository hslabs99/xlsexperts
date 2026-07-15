'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload, Eye } from 'lucide-react'
import type { BlogPostRecord } from '@/lib/blog-db'
// Image uploads remain browser Firebase Storage (not moved to API yet).
import { importSiteImageToStorage, uploadBlogImage } from '@/lib/blog-storage'
import {
  AdminBlogPreviewShell,
  type BlogPreviewKind,
} from '@/components/admin-blog-preview'
import { BlogImageSizeAdvice } from '@/components/blog-image-size-advice'
import {
  assessBlogImage,
  formatBytes,
  infoFromFile,
  BLOG_IMAGE_TARGETS,
} from '@/lib/blog-image-advice'
import type { BlogSection } from '@/lib/types'

type EditorMode = 'list' | 'edit' | 'preview'

const SECTION_TYPES: BlogSection['type'][] = [
  'intro',
  'h2',
  'h3',
  'p',
  'ul',
  'faq',
]

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
  const [form, setForm] = useState<BlogPostRecord>(emptyPost())
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState('')
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)

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
      setRows(data.items)
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
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.title, r.slug, r.category, r.author, r.excerpt]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [rows, search])

  function startNew() {
    setIsNew(true)
    setForm(emptyPost())
    setMode('edit')
    setMessage(null)
    setError(null)
  }

  function startEdit(post: BlogPostRecord) {
    setIsNew(false)
    setForm({ ...post, sections: post.sections.map((s) => ({ ...s })) })
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

  async function handleImport(overwrite: boolean, uploadImages = false) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/seed-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overwrite, uploadImages }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        created?: number
        updated?: number
        skipped?: number
        archiveCount?: number
        imagesUploaded?: number
        imagesFailed?: number
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Import failed')
      }
      setMessage(
        `Seeded v0 archive (${data.archiveCount} posts) → Firebase: ${data.created} created, ${data.updated} updated, ${data.skipped} skipped` +
          (uploadImages
            ? `; images ${data.imagesUploaded} uploaded, ${data.imagesFailed} failed.`
            : '.')
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleImportImages() {
    setBusy(true)
    setError(null)
    setMessage(null)
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
      let uploaded = 0
      let failed = 0
      for (const post of data.items) {
        if (!post.image.startsWith('/')) continue
        // Remains browser Storage SDK upload.
        const url = await importSiteImageToStorage(post.slug, post.image)
        if (!url) {
          failed += 1
          continue
        }
        const patchRes = await fetch('/api/admin/blogs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: post.slug, image: url }),
        })
        const patchData = (await patchRes.json()) as {
          ok?: boolean
          error?: string
        }
        if (!patchRes.ok || !patchData.ok) {
          failed += 1
          continue
        }
        uploaded += 1
      }
      setMessage(
        `Image Storage upload finished: ${uploaded} uploaded, ${failed} failed/skipped.`
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image import failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
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
      setMessage(`Saved “${form.title.trim()}” to Firebase.`)
      setIsNew(false)
      setForm((p) => ({ ...p, slug }))
      await load()
      setMode('list')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm(`Delete blog post “${slug}” from Firebase?`)) return
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
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleImageFile(file: File | null) {
    if (!file) return
    setPendingImageFile(file)
    const info = await infoFromFile(file)
    const advice = assessBlogImage(info)

    if (advice.level === 'too_large') {
      const proceed = window.confirm(
        `${advice.headline}\n\n${advice.detail}\n\nUpload anyway? We recommend compressing first.`
      )
      if (!proceed) {
        setPendingImageFile(null)
        return
      }
    } else if (advice.level === 'large') {
      const proceed = window.confirm(
        `${advice.headline}\n\n${advice.detail}\n\nUpload anyway?`
      )
      if (!proceed) {
        setPendingImageFile(null)
        return
      }
    }

    const slug = form.slug.trim() || slugify(form.title) || 'untitled'
    setBusy(true)
    setError(null)
    try {
      const url = await uploadBlogImage(slug, file)
      setForm((p) => ({ ...p, image: url, slug: p.slug || slug }))
      setMessage(
        `Image uploaded (${formatBytes(file.size)}). Aim under ${formatBytes(BLOG_IMAGE_TARGETS.idealMaxBytes)} when you can.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setPendingImageFile(null)
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
                Keep it simple: about 1600px wide, under{' '}
                {formatBytes(BLOG_IMAGE_TARGETS.idealMaxBytes)}, JPEG or WebP.
                We check the size for you after you pick a file.
              </p>
            </div>
            {form.image ? (
              <div className="relative h-40 w-full max-w-md overflow-hidden rounded border border-border bg-white">
                <Image
                  src={form.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                  unoptimized={form.image.startsWith('http')}
                />
              </div>
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
                  <textarea
                    value={section.text ?? ''}
                    onChange={(e) =>
                      updateSection(index, { text: e.target.value })
                    }
                    placeholder="Text"
                    rows={4}
                    className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
                  />
                )}

                {section.type === 'ul' && (
                  <textarea
                    value={(section.items ?? []).join('\n')}
                    onChange={(e) =>
                      updateSection(index, {
                        items: e.target.value
                          .split('\n')
                          .map((line) => line.trimEnd())
                          .filter((line, i, arr) =>
                            i === arr.length - 1 ? true : line.length > 0
                          ),
                      })
                    }
                    placeholder="One list item per line"
                    rows={5}
                    className="mt-3 w-full rounded-md border border-border px-3 py-2 font-mono text-xs"
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
                        <textarea
                          value={faq.a}
                          onChange={(e) => {
                            const faqs = [...(section.faqs ?? [])]
                            faqs[fi] = { ...faqs[fi], a: e.target.value }
                            updateSection(index, { faqs })
                          }}
                          placeholder="Answer"
                          rows={3}
                          className="mt-2 w-full rounded border border-border px-2 py-1.5 text-sm"
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
            {busy ? 'Saving…' : 'Save to Firebase'}
          </button>
          {!isNew && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDelete(form.slug)}
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
              Live: Firebase <code className="text-xs">blogPosts</code>. Seed
              source: frozen v0 archive in{' '}
              <code className="text-xs">lib/blog-posts.ts</code> (never deleted).
              Public layout unchanged.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleImport(false)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Seed from v0 archive
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    'Overwrite existing Firebase posts with the frozen v0 archive copies? Local archive files are not deleted.'
                  )
                ) {
                  void handleImport(true)
                }
              }}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Re-seed (overwrite)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    'Upload hero images from public/images into Firebase Storage and update post URLs?'
                  )
                ) {
                  void handleImport(false, true)
                }
              }}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Seed + push images
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleImportImages()}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Push images to Storage
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

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, slug, category, author…"
          className="mt-5 w-full max-w-md rounded-md border border-border px-3 py-2 text-sm"
        />

        <p className="mt-3 text-xs text-ink-muted">
          {filtered.length} of {rows.length} posts
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Author</th>
                <th className="py-2 pr-3">Published</th>
                <th className="py-2 pr-3">Featured</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-ink-muted">
                    Loading from Firebase…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-ink-muted">
                    No posts in Firebase yet. Click “Seed from v0 archive”.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.slug} className="border-b border-border/70">
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
                      {post.published ? (
                        <span className="font-semibold text-emerald-700">Yes</span>
                      ) : (
                        <span className="text-amber-700">Draft</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {post.featured ? '★' : '—'}
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
                          onClick={() => void handleDelete(post.slug)}
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
    </div>
  )
}
