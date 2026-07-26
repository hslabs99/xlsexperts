'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Sparkles, ImagePlus, ArrowRight } from 'lucide-react'
import type { CaseStudyAiDraft } from '@/lib/case-study-ai-types'

type Props = {
  /** Apply generated copy and/or image — either may be null if the user only wants one. */
  onApply: (draft: CaseStudyAiDraft | null, imageFile: File | null) => void
  onCancel: () => void
}

export function AdminCaseStudyAiAssist({ onApply, onCancel }: Props) {
  const [client, setClient] = useState('')
  const [title, setTitle] = useState('')
  const [sectorHint, setSectorHint] = useState('')
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState<'draft' | 'image' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<CaseStudyAiDraft | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function generateDraft() {
    setBusy('draft')
    setError(null)
    try {
      const res = await fetch('/api/admin/case-studies/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client, title, brief, sectorHint }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        draft?: CaseStudyAiDraft
        error?: string
      }
      if (!res.ok || !data.ok || !data.draft) {
        throw new Error(data.error || 'Draft generation failed')
      }
      setDraft(data.draft)
      setClient(data.draft.client)
      setTitle(data.draft.title)
      if (data.draft.sector) setSectorHint(data.draft.sector)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft generation failed')
    } finally {
      setBusy(null)
    }
  }

  async function generateImage() {
    if (!client.trim() || !title.trim()) {
      setError('Client and project title are required before generating an image.')
      return
    }
    setBusy('image')
    setError(null)
    try {
      const res = await fetch('/api/admin/case-studies/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client,
          title,
          sector: draft?.sector || sectorHint,
          imagePrompt: draft?.imagePrompt,
          brief,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        dataUrl?: string
        imageBase64?: string
        mimeType?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.imageBase64 || !data.dataUrl) {
        throw new Error(data.error || 'Image generation failed')
      }

      const binary = atob(data.imageBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const mime = data.mimeType || 'image/png'
      const blob = new Blob([bytes], { type: mime })
      const slugBit = (draft?.slug || title || 'case-study')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const file = new File([blob], `cs-ai-${slugBit || 'case'}.png`, {
        type: mime,
      })

      setImageDataUrl(data.dataUrl)
      setImageFile(file)
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
    onApply(nextDraft, nextImage)
  }

  const canApplyAnything = Boolean(draft || imageFile)

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
            AI Assist — create case study
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Enter the client, project name and a short brief. Generate copy
            and/or an image with OpenAI, preview them, then send either (or both)
            into the editor to review and save.
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-brand hover:underline"
          onClick={onCancel}
        >
          Back to list
        </button>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Client name</span>
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="e.g. Pullman Hotel Auckland"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Project / case title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="e.g. Valet Parking Hybrid App"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Sector hint (optional)</span>
          <input
            value={sectorHint}
            onChange={(e) => setSectorHint(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="e.g. Hospitality"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Brief description</span>
          <textarea
            rows={5}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="rounded-md border border-border px-3 py-2"
            placeholder="What was the problem, what did we build, and what changed for the client?"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null || !client.trim() || !title.trim() || !brief.trim()}
          onClick={() => void generateDraft()}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy === 'draft' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {busy === 'draft' ? 'Generating copy…' : 'Generate copy'}
        </button>
        <button
          type="button"
          disabled={busy !== null || !client.trim() || !title.trim()}
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
          disabled={!draft || busy !== null}
          onClick={() => applyToEditor(true, false)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Apply copy
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={!imageFile || busy !== null}
          onClick={() => applyToEditor(false, true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Apply image
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={!canApplyAnything || busy !== null}
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
              Copy preview
            </h4>
            {draft ? (
              <>
                <p className="mt-3 text-sm font-semibold text-ink">{draft.title}</p>
                <p className="text-xs text-ink-muted">
                  {draft.client} · {draft.sector} · {draft.slug}
                </p>
                {draft.summary && (
                  <p className="mt-3 text-sm text-ink-muted">{draft.summary}</p>
                )}
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-ink">Problem</dt>
                    <dd className="text-ink-muted">{draft.problem}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Solution</dt>
                    <dd className="text-ink-muted">{draft.solution}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Outcome</dt>
                    <dd className="text-ink-muted">{draft.outcome}</dd>
                  </div>
                </dl>
                {draft.tags.length > 0 && (
                  <p className="mt-3 text-xs text-ink-muted">
                    Tags: {draft.tags.join(', ')}
                  </p>
                )}
                {(draft.serviceSlugs.length > 0 ||
                  draft.solutionSlugs.length > 0) && (
                  <p className="mt-2 text-xs text-ink-muted">
                    Services: {draft.serviceSlugs.join(', ') || '—'}
                    <br />
                    Solutions: {draft.solutionSlugs.join(', ') || '—'}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                No copy yet. Click <strong>Generate copy</strong>, or{' '}
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
                  alt="AI-generated case study preview"
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
          </div>
        </div>
      )}
    </div>
  )
}
