'use client'

/**
 * Visual previews matching the public homepage case-study cards.
 * Always driven by Firestore / Storage URLs — not the local archive.
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import type { CaseStudyRecord } from '@/lib/case-studies-shared'
import type { CaseStudy } from '@/lib/types'

const overlays = [
  'rgba(18, 77, 43, 0.35)',
  'rgba(15, 60, 75, 0.35)',
  'rgba(45, 40, 30, 0.35)',
  'rgba(30, 55, 35, 0.35)',
]

const textBackings = [
  'rgba(18, 77, 43, 0.72)',
  'rgba(15, 60, 75, 0.72)',
  'rgba(45, 40, 30, 0.72)',
  'rgba(30, 55, 35, 0.72)',
]

function isCloudImage(src: string): boolean {
  return /^https:\/\//i.test(src.trim())
}

function CloudImageBadge({
  src,
  fromEditorDraft,
}: {
  src: string
  fromEditorDraft?: boolean
}) {
  if (fromEditorDraft || src.startsWith('blob:') || src.startsWith('data:')) {
    return (
      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-900 ring-1 ring-sky-200">
        Preview: unsaved editor draft
      </span>
    )
  }
  const cloud = isCloudImage(src)
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        cloud
          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
          : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
      }`}
    >
      {cloud ? 'Image: Firebase Storage / HTTPS' : 'Image: local path (not cloud yet)'}
    </span>
  )
}

function PreviewHeroImage({
  src,
  index,
}: {
  src: string
  index: number
}) {
  if (!src) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center text-xs text-white/80"
        style={{ backgroundColor: '#1a6b3c' }}
      >
        No image in Firestore
      </div>
    )
  }

  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center opacity-90"
        unoptimized={isCloudImage(src) || src.startsWith('blob:')}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlays[index % overlays.length] }}
        aria-hidden="true"
      />
    </>
  )
}

export function CaseStudyCardPreview({
  cs,
  index = 0,
}: {
  cs: CaseStudy
  index?: number
}) {
  return (
    <article className="flex flex-col border border-gray-200 bg-white">
      <div className="relative flex min-h-[140px] flex-col overflow-hidden px-7 py-5">
        <PreviewHeroImage src={cs.image} index={index} />
        <div
          className="relative inline-flex flex-col gap-2 rounded px-4 py-3"
          style={{ backgroundColor: textBackings[index % textBackings.length] }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#86efac' }}
          >
            {cs.sector || 'Sector'}
          </p>
          <h3 className="text-base font-bold text-white">
            {cs.title || 'Untitled case study'}
          </h3>
          <span className="self-start rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
            {cs.client || 'Client'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-7 py-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Problem
          </span>
          <p className="text-sm leading-relaxed text-gray-800">
            {cs.problem || '—'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Solution
          </span>
          <p className="text-sm leading-relaxed text-gray-800">
            {cs.solution || '—'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 rounded bg-gray-50 px-4 py-3">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#1a6b3c' }}
          >
            Outcome
          </span>
          <p className="text-sm leading-relaxed text-gray-800">
            {cs.outcome || '—'}
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Technologies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(cs.tags.length > 0 ? cs.tags : ['—']).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export type CaseStudyPreviewKind = 'card' | 'home'

export function AdminCaseStudiesPreviewShell({
  slug,
  kind,
  onKindChange,
  onClose,
  closeLabel,
  /** When set (e.g. from the editor), card preview uses this instead of requiring Firestore. */
  draft,
  draftMeta,
}: {
  /** Firestore document id / slug — preview reloads this from the cloud when no draft */
  slug: string
  kind: CaseStudyPreviewKind
  onKindChange: (kind: CaseStudyPreviewKind) => void
  onClose: () => void
  closeLabel?: string
  draft?: CaseStudy | null
  draftMeta?: Pick<
    CaseStudyRecord,
    'published' | 'showOnHome' | 'homeOrder'
  > | null
}) {
  const [card, setCard] = useState<CaseStudy | null>(draft ?? null)
  const [homeItems, setHomeItems] = useState<CaseStudy[]>([])
  const [recordMeta, setRecordMeta] = useState<CaseStudyRecord | null>(null)
  const [usingEditorDraft, setUsingEditorDraft] = useState(Boolean(draft))
  const [loading, setLoading] = useState(!draft)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadCloud() {
      // Editor draft can render immediately; homepage grid still needs Firestore.
      if (!draft) {
        setLoading(true)
      }
      setError(null)
      try {
        const listRes = await fetch('/api/admin/case-studies')
        const listData = (await listRes.json()) as {
          ok?: boolean
          items?: CaseStudyRecord[]
          error?: string
        }
        if (!listRes.ok || !listData.ok) {
          throw new Error(listData.error || 'Failed to load case studies')
        }
        const items = listData.items ?? []
        const record = slug
          ? items.find((r) => r.slug === slug) ?? null
          : null

        const home = items
          .filter((r) => r.published && r.showOnHome)
          .sort(
            (a, b) =>
              (a.homeOrder ?? 9999) - (b.homeOrder ?? 9999) ||
              (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
          )
          .slice(0, 4)
          .map((r) => ({
            slug: r.slug,
            client: r.client,
            sector: r.sector,
            title: r.title,
            image: r.image,
            problem: r.problem,
            solution: r.solution,
            outcome: r.outcome,
            tags: r.tags,
          }))

        if (cancelled) return
        setHomeItems(home)

        // Prefer the live editor draft for single-card preview so unsaved work
        // never hits a "slug not found" dead end.
        if (draft) {
          setCard(draft)
          setRecordMeta(record)
          setUsingEditorDraft(true)
          return
        }

        if (record) {
          setUsingEditorDraft(false)
          setRecordMeta(record)
          setCard({
            slug: record.slug,
            client: record.client,
            sector: record.sector,
            title: record.title,
            image: record.image,
            problem: record.problem,
            solution: record.solution,
            outcome: record.outcome,
            tags: record.tags,
          })
          return
        }
        setCard(null)
        setRecordMeta(null)
        setUsingEditorDraft(false)
        if (kind === 'card') {
          setError(
            'Nothing to preview yet. Fill in the editor fields, then try again.'
          )
        }
      } catch (err) {
        if (!cancelled) {
          // Still show the editor draft if we have one — don't trap the user.
          if (draft) {
            setCard(draft)
            setUsingEditorDraft(true)
            setError(null)
          } else {
            setError(
              err instanceof Error ? err.message : 'Failed to load cloud preview'
            )
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadCloud()
    return () => {
      cancelled = true
    }
  }, [slug, kind, draft])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Case study preview</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {usingEditorDraft && kind === 'card' ? (
              <>
                Showing your current editor draft (including unsaved changes).
                Matches the public homepage card layout.
              </>
            ) : (
              <>
                Loaded live from Firestore (
                <code className="text-xs">caseStudies</code>
                {kind === 'home' ? (
                  <>
                    {' '}
                    + published homepage studies
                  </>
                ) : null}
                ). Matches the public homepage card layout.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md border border-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => onKindChange('card')}
              className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                kind === 'card'
                  ? 'bg-brand text-white'
                  : 'text-ink hover:bg-surface-raised'
              }`}
            >
              Single card
            </button>
            <button
              type="button"
              onClick={() => onKindChange('home')}
              className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                kind === 'home'
                  ? 'bg-brand text-white'
                  : 'text-ink hover:bg-surface-raised'
              }`}
            >
              Homepage grid
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            {closeLabel ?? 'Back'}
          </button>
        </div>
      </div>

      {loading && !(kind === 'card' && card) ? (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
          Loading preview…
        </p>
      ) : kind === 'card' ? (
        error || !card ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800"
            role="alert"
          >
            {error ?? 'Case study not found in Firestore.'}
          </p>
        ) : (
          <div className="space-y-4 rounded-lg border border-border bg-surface p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <CloudImageBadge
                src={card.image}
                fromEditorDraft={usingEditorDraft}
              />
              <span className="text-xs text-ink-muted">
                slug{' '}
                <code className="text-[11px]">
                  {recordMeta?.slug || card.slug || 'draft'}
                </code>
                {usingEditorDraft
                  ? ' · editor draft'
                  : recordMeta
                    ? `${recordMeta.published ? ' · published' : ' · unpublished'}${
                        recordMeta.showOnHome
                          ? ` · on home (#${recordMeta.homeOrder})`
                          : ''
                      }`
                    : draftMeta
                      ? `${draftMeta.published ? ' · published' : ' · unpublished'}${
                          draftMeta.showOnHome
                            ? ` · on home (#${draftMeta.homeOrder})`
                            : ''
                        }`
                      : ''}
              </span>
            </div>
            <div className="mx-auto max-w-xl">
              <CaseStudyCardPreview cs={card} index={0} />
            </div>
            {!usingEditorDraft &&
            card.image &&
            !isCloudImage(card.image) &&
            !card.image.startsWith('blob:') &&
            !card.image.startsWith('data:') ? (
              <p className="text-sm text-amber-900">
                This study still uses a local{' '}
                <code className="text-xs">/images/…</code> path. Push the hero
                to Firebase Storage so production and emails can load it from the
                cloud.
              </p>
            ) : null}
          </div>
        )
      ) : error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : (
        <div
          className="overflow-hidden rounded-lg border border-border"
          style={{ backgroundColor: '#e8f5ee' }}
        >
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Proof of work
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Case Studies
              </h2>
              <p className="mt-3 text-sm text-ink-muted">
                Published homepage snapshot from Firebase (
                {homeItems.length} card{homeItems.length === 1 ? '' : 's'})
              </p>
            </div>

            {homeItems.length === 0 ? (
              <p className="mt-10 text-center text-sm text-ink-muted">
                Homepage snapshot is empty. Select studies with{' '}
                <strong>Show on home</strong>, then click{' '}
                <strong>Publish homepage</strong>.
              </p>
            ) : (
              <>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {homeItems.every((item) => isCloudImage(item.image)) ? (
                    <CloudImageBadge src={homeItems[0]?.image ?? ''} />
                  ) : (
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
                      Some images still use local paths — upload to Storage
                    </span>
                  )}
                </div>
                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                  {homeItems.map((cs, index) => (
                    <CaseStudyCardPreview
                      key={cs.slug}
                      cs={cs}
                      index={index}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function PreviewCaseStudyButton({
  onClick,
  label = 'Preview',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
    >
      <Eye className="h-4 w-4" />
      {label}
    </button>
  )
}
