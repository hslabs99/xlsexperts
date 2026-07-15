'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
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

function CaseStudyCard({
  cs,
  index,
}: {
  cs: CaseStudy
  index: number
}) {
  return (
    <article className="flex flex-col border border-gray-200 bg-white">
      <div className="relative flex min-h-[140px] flex-col overflow-hidden px-7 py-5">
        {cs.image ? (
          <Image
            src={cs.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center opacity-90"
            loading={index < 2 ? 'eager' : 'lazy'}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: '#1a6b3c' }}
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlays[index % overlays.length] }}
          aria-hidden="true"
        />
        <div
          className="relative inline-flex flex-col gap-2 rounded px-4 py-3"
          style={{ backgroundColor: textBackings[index % textBackings.length] }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#86efac' }}
          >
            {cs.sector}
          </p>
          <h3 className="text-base font-bold text-white">{cs.title}</h3>
          <span className="self-start rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
            {cs.client}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-7 py-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Problem
          </span>
          <p className="text-sm leading-relaxed text-gray-800">{cs.problem}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Solution
          </span>
          <p className="text-sm leading-relaxed text-gray-800">{cs.solution}</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded bg-gray-50 px-4 py-3">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#1a6b3c' }}
          >
            Outcome
          </span>
          <p className="text-sm leading-relaxed text-gray-800">{cs.outcome}</p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Technologies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cs.tags.map((tag) => (
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

type CaseStudiesProps = {
  /** First four (or fewer) from the published homepage snapshot — SSR, no client wait */
  initialItems: CaseStudy[]
  /** False when we already know there is nothing beyond the snapshot */
  initialHasMore?: boolean
}

export function CaseStudies({
  initialItems,
  initialHasMore = true,
}: CaseStudiesProps) {
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const visibleSlugs = useMemo(
    () => items.map((i) => i.slug).filter(Boolean),
    [items]
  )

  function loadMore() {
    setError(null)
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          exclude: visibleSlugs.join(','),
          limit: '4',
        })
        const res = await fetch(`/api/case-studies/more?${params.toString()}`)
        const data = (await res.json()) as {
          ok?: boolean
          items?: CaseStudy[]
          hasMore?: boolean
          error?: string
        }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Could not load more case studies')
        }
        const next = data.items ?? []
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.slug))
          return [...prev, ...next.filter((n) => !seen.has(n.slug))]
        })
        setHasMore(Boolean(data.hasMore) && next.length > 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Load failed')
      }
    })
  }

  return (
    <section
      id="case-studies"
      className="py-20 sm:py-28"
      style={{ backgroundColor: '#e8f5ee' }}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
            Proof of work
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Case Studies
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            Real problems, real solutions. A sample of what we have built for NZ
            businesses across industries.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {items.map((cs, index) => (
            <CaseStudyCard key={cs.slug || cs.title} cs={cs} index={index} />
          ))}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              disabled={pending}
              onClick={loadMore}
              className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Loading…
                </>
              ) : (
                <>Show more case studies</>
              )}
            </button>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-500">
            We have 350+ projects across construction, finance, retail, logistics
            and more.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-75"
            style={{ color: '#1a6b3c' }}
          >
            Book a free discovery call
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
