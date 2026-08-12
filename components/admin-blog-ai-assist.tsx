'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Loader2,
  Sparkles,
  ImagePlus,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Library,
} from 'lucide-react'
import type { AiSystemPrompt, AiSystemPromptKind } from '@/lib/ai-system-prompts'
import type { BlogAiDraft } from '@/lib/blog-ai-types'
import {
  blogAiAssistSessionHasWork,
  clearBlogAiAssistSession,
  combineSystemPrompts,
  dataUrlToFile,
  loadBlogAiAssistSession,
  saveBlogAiAssistSession,
} from '@/lib/blog-ai-assist-session'

type Props = {
  onApply: (draft: BlogAiDraft | null, imageFile: File | null) => void
  onCancel: () => void
  cancelLabel?: string
}

type PromptFormState = {
  id: string | null
  kind: AiSystemPromptKind
  name: string
  description: string
  systemPrompt: string
}

function emptyPromptForm(kind: AiSystemPromptKind): PromptFormState {
  return {
    id: null,
    kind,
    name: '',
    description: '',
    systemPrompt: '',
  }
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

export function AdminBlogAiAssist({
  onApply,
  onCancel,
  cancelLabel = 'Back to list',
}: Props) {
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [categoryHint, setCategoryHint] = useState('')
  const [prompts, setPrompts] = useState<AiSystemPrompt[]>([])
  const [draftPromptIds, setDraftPromptIds] = useState<string[]>([])
  const [imagePromptIds, setImagePromptIds] = useState<string[]>([])
  const [busy, setBusy] = useState<'draft' | 'image' | 'prompts' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [draft, setDraft] = useState<BlogAiDraft | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [promptForm, setPromptForm] = useState<PromptFormState | null>(null)
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  const draftPrompts = useMemo(
    () => prompts.filter((p) => p.kind === 'blog-draft' && p.active),
    [prompts]
  )
  const imagePrompts = useMemo(
    () => prompts.filter((p) => p.kind === 'blog-image' && p.active),
    [prompts]
  )

  const selectedDraftPrompts = useMemo(
    () => draftPrompts.filter((p) => draftPromptIds.includes(p.id)),
    [draftPrompts, draftPromptIds]
  )
  const selectedImagePrompts = useMemo(
    () => imagePrompts.filter((p) => imagePromptIds.includes(p.id)),
    [imagePrompts, imagePromptIds]
  )

  const combinedDraftSystemPrompt = useMemo(
    () => combineSystemPrompts(selectedDraftPrompts),
    [selectedDraftPrompts]
  )
  const combinedImageSystemPrompt = useMemo(
    () => combineSystemPrompts(selectedImagePrompts),
    [selectedImagePrompts]
  )

  useEffect(() => {
    const restored = loadBlogAiAssistSession()
    if (restored && blogAiAssistSessionHasWork(restored)) {
      setTitle(restored.title)
      setBrief(restored.brief)
      setUserPrompt(restored.userPrompt)
      setCategoryHint(restored.categoryHint)
      setDraftPromptIds(restored.draftPromptIds)
      setImagePromptIds(restored.imagePromptIds)
      setDraft(restored.draft)
      setImageDataUrl(restored.imageDataUrl)
      if (restored.imageDataUrl) {
        setImageFile(
          dataUrlToFile(
            restored.imageDataUrl,
            restored.imageFileName || 'blog-ai-image.png',
            restored.imageMimeType
          )
        )
      }
      setMessage(
        'Restored your in-progress AI Assist work from this browser session.'
      )
    }
    setSessionReady(true)
  }, [])

  useEffect(() => {
    if (!sessionReady) return
    saveBlogAiAssistSession({
      title,
      brief,
      userPrompt,
      categoryHint,
      draftPromptIds,
      imagePromptIds,
      draft,
      imageDataUrl,
      imageMimeType: imageFile?.type ?? null,
      imageFileName: imageFile?.name ?? null,
      updatedAt: Date.now(),
    })
  }, [
    sessionReady,
    title,
    brief,
    userPrompt,
    categoryHint,
    draftPromptIds,
    imagePromptIds,
    draft,
    imageDataUrl,
    imageFile,
  ])

  const loadPrompts = useCallback(async (opts?: { seedIfEmpty?: boolean }) => {
    setBusy('prompts')
    setError(null)
    try {
      let res = await fetch('/api/admin/ai-system-prompts')
      let data = (await res.json()) as {
        ok?: boolean
        items?: AiSystemPrompt[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load system prompts')
      }

      if (opts?.seedIfEmpty && data.items.length === 0) {
        const seedRes = await fetch('/api/admin/ai-system-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'seed' }),
        })
        const seedData = (await seedRes.json()) as {
          ok?: boolean
          error?: string
          created?: number
        }
        if (!seedRes.ok || !seedData.ok) {
          throw new Error(seedData.error || 'Failed to seed default prompts')
        }
        res = await fetch('/api/admin/ai-system-prompts')
        data = (await res.json()) as {
          ok?: boolean
          items?: AiSystemPrompt[]
          error?: string
        }
        if (!res.ok || !data.ok || !data.items) {
          throw new Error(data.error || 'Failed to reload system prompts')
        }
        if ((seedData.created ?? 0) > 0) {
          setMessage(`Loaded ${seedData.created} default system prompt(s).`)
        }
      }

      setPrompts(data.items)
      const drafts = data.items.filter(
        (p) => p.kind === 'blog-draft' && p.active
      )
      const images = data.items.filter(
        (p) => p.kind === 'blog-image' && p.active
      )
      setDraftPromptIds((prev) => {
        const kept = prev.filter((id) => drafts.some((p) => p.id === id))
        if (kept.length > 0) return kept
        return drafts[0]?.id ? [drafts[0].id] : []
      })
      setImagePromptIds((prev) => {
        const kept = prev.filter((id) => images.some((p) => p.id === id))
        if (kept.length > 0) return kept
        return images[0]?.id ? [images[0].id] : []
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
    } finally {
      setBusy(null)
    }
  }, [])

  useEffect(() => {
    void loadPrompts({ seedIfEmpty: true })
  }, [loadPrompts])

  async function generateDraft() {
    if (selectedDraftPrompts.length === 0) {
      setError('Select at least one blog system prompt first.')
      return
    }
    setBusy('draft')
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/blogs/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brief,
          userPrompt,
          systemPrompt: combinedDraftSystemPrompt,
          categoryHint,
          authorHint: 'Mike',
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        draft?: BlogAiDraft
        error?: string
      }
      if (!res.ok || !data.ok || !data.draft) {
        throw new Error(data.error || 'Draft generation failed')
      }
      setDraft(data.draft)
      setTitle(data.draft.title)
      if (data.draft.category) setCategoryHint(data.draft.category)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft generation failed')
    } finally {
      setBusy(null)
    }
  }

  async function generateImage() {
    if (!title.trim()) {
      setError('Title is required before generating an image.')
      return
    }
    setBusy('image')
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/blogs/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          systemPrompt: combinedImageSystemPrompt,
          imagePrompt: draft?.imagePrompt,
          brief,
          userPrompt,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        dataUrl?: string
        imageBase64?: string
        mimeType?: string
        error?: string
        originalBytes?: number
        optimizedBytes?: number
      }
      if (!res.ok || !data.ok || !data.imageBase64 || !data.dataUrl) {
        throw new Error(data.error || 'Image generation failed')
      }

      const binary = atob(data.imageBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const mime = data.mimeType || 'image/webp'
      const blob = new Blob([bytes], { type: mime })
      const slugBit = (draft?.slug || title || 'blog')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const ext = mime.includes('jpeg')
        ? 'jpg'
        : mime.includes('png')
          ? 'png'
          : 'webp'
      const file = new File([blob], `blog-ai-${slugBit || 'post'}.${ext}`, {
        type: mime,
      })

      setImageDataUrl(data.dataUrl)
      setImageFile(file)
      const optimizedBytes =
        typeof data.optimizedBytes === 'number' ? data.optimizedBytes : file.size
      const originalBytes =
        typeof data.originalBytes === 'number' ? data.originalBytes : null
      setMessage(
        originalBytes != null && originalBytes > optimizedBytes
          ? `Image ready — compressed for the web (${Math.round(originalBytes / 1024)} KB → ${Math.round(optimizedBytes / 1024)} KB).`
          : `Image ready — web-optimized (${Math.round(optimizedBytes / 1024)} KB).`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed')
    } finally {
      setBusy(null)
    }
  }

  function applyToEditor(includeDraft: boolean, includeImage: boolean) {
    const nextDraft = includeDraft ? draft : null
    const nextImage = includeImage ? imageFile : null
    if (!nextDraft && !nextImage) {
      setError('Generate copy and/or an image first, then apply to the editor.')
      return
    }
    clearBlogAiAssistSession()
    onApply(nextDraft, nextImage)
  }

  async function savePromptForm() {
    if (!promptForm) return
    const name = promptForm.name.trim()
    const systemPrompt = promptForm.systemPrompt.trim()
    if (!name || !systemPrompt) {
      setError('Prompt name and system prompt text are required.')
      return
    }
    setBusy('prompts')
    setError(null)
    setMessage(null)
    try {
      if (promptForm.id) {
        const res = await fetch('/api/admin/ai-system-prompts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: promptForm.id,
            kind: promptForm.kind,
            name,
            description: promptForm.description.trim(),
            systemPrompt,
          }),
        })
        const data = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to update prompt')
        }
        setMessage('System prompt updated. Your blog inputs are still here.')
      } else {
        const res = await fetch('/api/admin/ai-system-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: promptForm.kind,
            name,
            description: promptForm.description.trim(),
            systemPrompt,
            active: true,
          }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          id?: string
          error?: string
        }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to create prompt')
        }
        setMessage('System prompt added. Your blog inputs are still here.')
        if (data.id) {
          if (promptForm.kind === 'blog-draft') {
            setDraftPromptIds((prev) =>
              prev.includes(data.id!) ? prev : [...prev, data.id!]
            )
          } else {
            setImagePromptIds((prev) =>
              prev.includes(data.id!) ? prev : [...prev, data.id!]
            )
          }
        }
      }
      setPromptForm(null)
      await loadPrompts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
      setBusy(null)
    }
  }

  async function confirmDeletePrompt() {
    if (!deletePromptId) return
    setBusy('prompts')
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(
        `/api/admin/ai-system-prompts?id=${encodeURIComponent(deletePromptId)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to delete prompt')
      }
      setDeletePromptId(null)
      setMessage('System prompt deleted.')
      await loadPrompts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt')
      setBusy(null)
    }
  }

  const canApplyAnything = Boolean(draft || imageFile)
  const generating = busy === 'draft' || busy === 'image'

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
            AI Assist — create blog post
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Select one or more system prompts, enter a title, brief and your
            writing angle, then generate markdown copy and/or a hero image.
            Your work is kept while you manage the prompt library or leave and
            come back in this browser session.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            onClick={() => setShowLibrary((v) => !v)}
          >
            <Library className="h-4 w-4" aria-hidden="true" />
            {showLibrary ? 'Hide prompt library' : 'Manage prompt library'}
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-brand hover:underline"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>

      {(error || message) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-brand/30 bg-brand-light text-brand-dark'
          }`}
          role={error ? 'alert' : undefined}
        >
          {error || message}
        </div>
      )}

      {showLibrary && (
        <div className="space-y-4 rounded-md border border-border bg-surface-raised p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                System prompt library
              </h4>
              <p className="mt-1 text-xs text-ink-muted">
                Edit prompts here anytime — title, brief, generated copy and
                image below stay intact.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setPromptForm(emptyPromptForm('blog-draft'))}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                Add draft prompt
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setPromptForm(emptyPromptForm('blog-image'))}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                Add image prompt
              </button>
            </div>
          </div>

          {prompts.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No prompts yet. Defaults load automatically; or add your own.
            </p>
          ) : (
            <ul className="space-y-2">
              {prompts.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-border bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted">
                      {p.kind === 'blog-draft' ? 'Blog draft' : 'Blog image'}
                      {p.description ? ` · ${p.description}` : ''}
                      {!p.active ? ' · inactive' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={busy !== null}
                      title="Edit"
                      onClick={() =>
                        setPromptForm({
                          id: p.id,
                          kind: p.kind,
                          name: p.name,
                          description: p.description,
                          systemPrompt: p.systemPrompt,
                        })
                      }
                      className="rounded-md border border-border p-1.5 text-ink-muted hover:bg-surface-raised disabled:opacity-60"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      title="Delete"
                      onClick={() => setDeletePromptId(p.id)}
                      className="rounded-md border border-red-200 p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {promptForm && (
            <div className="space-y-3 rounded-md border border-brand/30 bg-white p-3">
              <p className="text-sm font-semibold text-ink">
                {promptForm.id ? 'Edit system prompt' : 'New system prompt'}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Kind</span>
                  <select
                    value={promptForm.kind}
                    onChange={(e) =>
                      setPromptForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              kind: e.target.value as AiSystemPromptKind,
                            }
                          : prev
                      )
                    }
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <option value="blog-draft">Blog draft</option>
                    <option value="blog-image">Blog image</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Name</span>
                  <input
                    value={promptForm.name}
                    onChange={(e) =>
                      setPromptForm((prev) =>
                        prev ? { ...prev, name: e.target.value } : prev
                      )
                    }
                    className="rounded-md border border-border px-3 py-2"
                    placeholder="e.g. Excel experts tone"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">
                    Short description (optional)
                  </span>
                  <input
                    value={promptForm.description}
                    onChange={(e) =>
                      setPromptForm((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev
                      )
                    }
                    className="rounded-md border border-border px-3 py-2"
                    placeholder="Shown in the library list"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">System prompt</span>
                  <textarea
                    rows={8}
                    value={promptForm.systemPrompt}
                    onChange={(e) =>
                      setPromptForm((prev) =>
                        prev ? { ...prev, systemPrompt: e.target.value } : prev
                      )
                    }
                    className="rounded-md border border-border px-3 py-2 font-mono text-xs"
                    placeholder="Instructions carried with every generation…"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void savePromptForm()}
                  className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {busy === 'prompts' ? 'Saving…' : 'Save prompt'}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => setPromptForm(null)}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deletePromptId && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <span>Delete this system prompt?</span>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void confirmDeletePrompt()}
                className="rounded-md bg-red-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Delete
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setDeletePromptId(null)}
                className="rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-medium text-ink">
            Blog system prompts
            <span className="ml-1 font-normal text-ink-muted">
              (select one or more — combined for generation)
            </span>
          </legend>
          {draftPrompts.length === 0 ? (
            <p className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink-muted">
              No draft prompts — open the library to add some.
            </p>
          ) : (
            <ul className="space-y-2 rounded-md border border-border bg-white p-3">
              {draftPrompts.map((p) => {
                const checked = draftPromptIds.includes(p.id)
                return (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={busy === 'prompts'}
                        onChange={() =>
                          setDraftPromptIds((prev) => toggleId(prev, p.id))
                        }
                      />
                      <span>
                        <span className="font-semibold text-ink">{p.name}</span>
                        {p.description ? (
                          <span className="block text-xs text-ink-muted">
                            {p.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </fieldset>

        {selectedDraftPrompts.length > 0 && (
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-ink">
              Combined system prompt
              {selectedDraftPrompts.length > 1
                ? ` (${selectedDraftPrompts.length} selected)`
                : ''}{' '}
              (sent with your request)
            </span>
            <textarea
              readOnly
              rows={Math.min(10, 4 + selectedDraftPrompts.length * 2)}
              value={combinedDraftSystemPrompt}
              className="rounded-md border border-border bg-surface-raised px-3 py-2 font-mono text-xs text-ink-muted"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="e.g. When to use Power Query vs VBA"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Category hint (optional)</span>
          <input
            value={categoryHint}
            onChange={(e) => setCategoryHint(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="e.g. Power Query"
          />
        </label>
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium text-ink">
            Image system prompts
            <span className="ml-1 font-normal text-ink-muted">
              (optional, multi-select)
            </span>
          </legend>
          {imagePrompts.length === 0 ? (
            <p className="rounded-md border border-border bg-surface-raised px-3 py-2 text-ink-muted">
              Default style (no library prompt)
            </p>
          ) : (
            <ul className="space-y-2 rounded-md border border-border bg-white p-3">
              {imagePrompts.map((p) => {
                const checked = imagePromptIds.includes(p.id)
                return (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={busy === 'prompts'}
                        onChange={() =>
                          setImagePromptIds((prev) => toggleId(prev, p.id))
                        }
                      />
                      <span className="font-semibold text-ink">{p.name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </fieldset>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Brief description</span>
          <textarea
            rows={3}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="What should this post cover, and who is it for?"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Your prompt / angle</span>
          <textarea
            rows={4}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="Extra instructions: tone, sections to include, CTAs, things to avoid…"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={
            generating ||
            !title.trim() ||
            (!brief.trim() && !userPrompt.trim()) ||
            selectedDraftPrompts.length === 0
          }
          onClick={() => void generateDraft()}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy === 'draft' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {busy === 'draft' ? 'Generating blog…' : 'Generate blog'}
        </button>
        <button
          type="button"
          disabled={generating || !title.trim()}
          onClick={() => void generateImage()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          {busy === 'image' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          )}
          {busy === 'image' ? 'Generating image…' : 'Generate image'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          disabled={!draft || generating}
          onClick={() => applyToEditor(true, false)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Apply copy
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={!imageFile || generating}
          onClick={() => applyToEditor(false, true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Apply image
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={!canApplyAnything || generating}
          onClick={() => applyToEditor(Boolean(draft), Boolean(imageFile))}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand/15 disabled:opacity-60"
        >
          Apply both to editor
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {(draft || imageDataUrl) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-surface-raised p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              Markdown / copy preview
            </h4>
            {draft ? (
              <>
                <p className="mt-3 text-sm font-semibold text-ink">
                  {draft.title}
                </p>
                <p className="text-xs text-ink-muted">
                  {draft.category} · {draft.slug} · {draft.readTime} ·{' '}
                  {draft.sections.length} sections
                </p>
                {draft.excerpt && (
                  <p className="mt-3 text-sm text-ink-muted">{draft.excerpt}</p>
                )}
                <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-white p-3 font-mono text-xs text-ink">
                  {draft.markdown}
                </pre>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                No copy yet. Click <strong>Generate blog</strong>, or{' '}
                <strong>Apply image</strong> alone into the editor.
              </p>
            )}
          </div>

          <div className="rounded-md border border-border bg-surface-raised p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              Image preview
            </h4>
            {imageDataUrl ? (
              <div className="relative mt-3 aspect-[3/2] w-full overflow-hidden rounded-md border border-border bg-white">
                <Image
                  src={imageDataUrl}
                  alt="AI-generated blog preview"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="600px"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                No image yet. Click <strong>Generate image</strong> after (or
                before) generating copy.
              </p>
            )}
            {draft?.imagePrompt && (
              <p className="mt-3 text-xs text-ink-muted">
                Image prompt: {draft.imagePrompt}
              </p>
            )}
            {selectedImagePrompts.length > 0 && (
              <p className="mt-2 text-xs text-ink-muted">
                Image style
                {selectedImagePrompts.length > 1 ? 's' : ''}:{' '}
                {selectedImagePrompts.map((p) => p.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
