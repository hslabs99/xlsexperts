'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { CaseStudy } from '@/lib/types'
import { MORE_CASE_STUDIES_PAGE_SIZE } from '@/lib/case-studies-shared'
import { useMarketCopy } from '@/components/market-provider'
import { CaseStudySummaryCard } from '@/components/case-study-summary-card'

type CaseStudiesProps = {
  /** First paint from the published homepage snapshot — SSR, no client wait */
  initialItems: CaseStudy[]
  /** False when we already know there is nothing beyond the snapshot */
  initialHasMore?: boolean
  /** How many extra cards each Show more click loads */
  morePageSize?: number
}

export function CaseStudies({
  initialItems,
  initialHasMore = true,
  morePageSize = MORE_CASE_STUDIES_PAGE_SIZE,
}: CaseStudiesProps) {
  const copy = useMarketCopy()
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
          limit: String(morePageSize),
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
            {copy.caseStudies.homeIntro}
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {items.map((cs, index) => (
            <CaseStudySummaryCard
              key={cs.slug || cs.title}
              cs={cs}
              index={index}
            />
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

        <div className="mt-10 flex justify-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-75"
            style={{ color: '#1a6b3c' }}
          >
            All case studies
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

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
