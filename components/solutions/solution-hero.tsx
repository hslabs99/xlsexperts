import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/solutions/breadcrumbs'
import { ALL_SOLUTIONS_HREF } from '@/lib/solutions'

type SolutionHeroProps = {
  eyebrow: string
  heading: string
  introduction: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  breadcrumbs?: BreadcrumbItem[]
}

export function SolutionHero({
  eyebrow,
  heading,
  introduction,
  primaryCta,
  secondaryCta,
  breadcrumbs,
}: SolutionHeroProps) {
  const crumbs: BreadcrumbItem[] = breadcrumbs ?? [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: ALL_SOLUTIONS_HREF },
    { label: eyebrow },
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
        <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
          {eyebrow}
        </span>
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
