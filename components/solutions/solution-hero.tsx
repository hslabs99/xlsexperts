import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/solutions/breadcrumbs'
import { ALL_SOLUTIONS_HREF } from '@/lib/solutions'

const SOLUTION_FRAMING =
  'We bring deep practical experience and a proven understanding of the challenges and solutions in this area.'

type SolutionHeroProps = {
  /** Used for the final breadcrumb when `breadcrumbs` is not provided. */
  breadcrumbLabel: string
  heading: string
  introduction: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  breadcrumbs?: BreadcrumbItem[]
  framing?: string
}

export function SolutionHero({
  breadcrumbLabel,
  heading,
  introduction,
  primaryCta,
  secondaryCta,
  breadcrumbs,
  framing = SOLUTION_FRAMING,
}: SolutionHeroProps) {
  const crumbs: BreadcrumbItem[] = breadcrumbs ?? [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: ALL_SOLUTIONS_HREF },
    { label: breadcrumbLabel },
  ]

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{
        background:
          'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6">
        <Breadcrumbs items={crumbs} />
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-white/75">
          {framing}
        </p>
        <h1 className="font-display mb-6 max-w-3xl text-4xl font-bold leading-tight text-white text-balance md:text-5xl">
          {heading}
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
          {introduction}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={primaryCta.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {primaryCta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
