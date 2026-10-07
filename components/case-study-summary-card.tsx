import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { IndustrySectorTag } from '@/components/industries/industry-sector-tag'
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

/** Same wash and title plate as the case study cards. */
export function caseStudyHeaderTone(index: number): {
  overlay: string
  backing: string
} {
  const i = ((index % overlays.length) + overlays.length) % overlays.length
  return { overlay: overlays[i], backing: textBackings[i] }
}

export function CaseStudySummaryCard({
  cs,
  index,
}: {
  cs: CaseStudy
  index: number
}) {
  const tone = caseStudyHeaderTone(index)
  return (
    <article className="group flex flex-col border border-gray-200 bg-white text-left transition hover:border-[#1a6b3c]">
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
          style={{ backgroundColor: tone.overlay }}
          aria-hidden="true"
        />
        <div
          className="relative inline-flex flex-col gap-2 rounded px-4 py-3"
          style={{ backgroundColor: tone.backing }}
        >
          {cs.sector ? (
            <IndustrySectorTag
              sector={cs.sector}
              className="text-xs font-semibold uppercase tracking-widest text-[#86efac]"
            />
          ) : null}
          <h3 className="text-base font-bold text-white">
            <Link
              href={`/case-studies/${cs.slug}`}
              className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {cs.title}
            </Link>
          </h3>
          {cs.client ? (
            <span className="self-start rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
              {cs.client}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-7 py-6">
        {cs.outcome ? (
          <p className="text-sm leading-relaxed text-gray-800">{cs.outcome}</p>
        ) : null}
        <Link
          href={`/case-studies/${cs.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
          style={{ color: '#1a6b3c' }}
        >
          Read case study
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  )
}
