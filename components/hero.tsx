'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useMarketCopy } from '@/components/market-provider'
import { HeroBackground } from '@/components/hero-background'
import { heroProjectIcons } from '@/components/hero-project-icons'
import { HeroClientCarousel } from '@/components/hero-client-carousel'
import {
  DEFAULT_HERO_PROJECTS_INTRO,
  defaultHeroProjects,
  type HeroTrustContent,
} from '@/lib/hero-trust'

const badgeClassName =
  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest transition hover:brightness-95'
const badgeStyle = { backgroundColor: '#e8f5ee', color: '#1a6b3c' }

export function Hero({
  trust,
  backgroundHoldSeconds,
  topBullets,
}: {
  trust?: HeroTrustContent
  backgroundHoldSeconds?: number
  topBullets?: string[]
}) {
  const copy = useMarketCopy()
  const commonProjects = trust?.projects?.length
    ? trust.projects
    : defaultHeroProjects()
  const projectsIntro =
    trust?.projectsIntro?.trim() || DEFAULT_HERO_PROJECTS_INTRO
  const clientNames = trust?.clients ?? []
  const trustPoints =
    topBullets && topBullets.length > 0
      ? topBullets
      : [
          'Fixed-price projects available',
          copy.hero.trustBased,
          'Trusted by SMEs & enterprise',
        ]
  const badges = [
    {
      label: copy.hero.badgeSpecialists,
      href: copy.hero.badgeSpecialistsHref?.trim() || '',
    },
    {
      label: copy.hero.badgeEnterprise,
      href: copy.hero.badgeEnterpriseHref?.trim() || '',
    },
    {
      label: copy.hero.badgeAi,
      href: copy.hero.badgeAiHref?.trim() || '',
    },
  ]

  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden bg-white pt-16"
    >
      {/* Rotating industry background — manufacturing, finance, engineering, logistics */}
      <HeroBackground holdSeconds={backgroundHoldSeconds} />

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 pt-10 text-center lg:pt-14">

        <p
          className="mb-8 text-balance text-[1.72265625rem] font-bold uppercase leading-tight tracking-[0.12em] sm:text-[1.96875rem] lg:text-[2.625rem]"
          style={{ color: '#1a6b3c' }}
        >
          {copy.hero.line1}
          <br />
          {copy.hero.line2}
        </p>

        {/* Eyebrow badge strip */}
        <div className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {badges.map((badge) =>
            badge.href ? (
              <Link
                key={`${badge.label}-${badge.href}`}
                href={badge.href}
                className={badgeClassName}
                style={badgeStyle}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#1a6b3c' }}
                  aria-hidden="true"
                />
                {badge.label}
              </Link>
            ) : (
              <span
                key={badge.label}
                className={badgeClassName}
                style={badgeStyle}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#1a6b3c' }}
                  aria-hidden="true"
                />
                {badge.label}
              </span>
            )
          )}
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[56px]">
          We automate your{' '}
          <span style={{ color: '#1a6b3c' }}>Excel and Google spreadsheets,</span>{' '}
          business data and workflows.
        </h1>

        {/* Body copy */}
        <p className="mx-auto mt-4 max-w-2xl text-balance text-base font-medium leading-relaxed text-gray-800">
          Whether you&apos;re managing a complex financial model, replacing manual reporting,
          building a costing solution or looking to build a custom business application, we create
          practical solutions that save time, improve accuracy and scale with your business.
        </p>

        {/* Trust checklist */}
        <ul
          className="mx-auto mt-7 flex flex-col items-start gap-2.5 sm:max-w-xs"
          aria-label="Key benefits"
        >
          {trustPoints.map((point, index) => (
            <li key={`${index}-${point}`} className="flex items-center gap-2.5 text-sm font-medium text-gray-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#1a6b3c' }} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#contact"
            data-funnel-cta="Get a free quote"
            className="btn-primary inline-flex h-11 items-center gap-2 rounded-lg px-7 text-sm font-semibold shadow-sm"
          >
            Get a free quote
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#how-we-work"
            className="inline-flex h-11 items-center rounded-lg border border-gray-200 bg-white px-7 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            See how we work
          </a>
          <a
            href="#case-studies"
            className="inline-flex h-11 items-center rounded-lg border border-gray-200 bg-white px-7 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            View Case Studies
          </a>
          <Link
            href="/use-cases"
            className="inline-flex h-11 items-center rounded-lg border border-gray-200 bg-white px-7 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            View A.I. use cases
          </Link>
        </div>

        {/* Common projects */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-700">
            Common projects
          </span>
          <p className="mx-auto max-w-2xl text-balance text-sm font-medium leading-relaxed text-gray-800">
            {projectsIntro}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {commonProjects.map((project) => {
              const Icon = heroProjectIcons[project.icon] ?? heroProjectIcons.zap
              return (
                <span
                  key={project.id || project.label}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 py-1.5 pl-2.5 pr-3.5 text-xs font-medium text-gray-800 shadow-sm"
                >
                  {project.iconSrc ? (
                    <Image
                      src={project.iconSrc}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 object-contain"
                    />
                  ) : (
                    <Icon className="h-3.5 w-3.5 text-[#1a6b3c]" aria-hidden="true" />
                  )}
                  {project.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="relative pb-20">
        <HeroClientCarousel
          clients={clientNames}
          fade={trust?.fade}
          heading={trust?.heading}
        />
      </div>

      {/* Stats bar */}
      <div className="relative border-t border-gray-100" style={{ backgroundColor: '#f9fafb' }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px sm:grid-cols-4" style={{ backgroundColor: '#e5e7eb' }}>
          {[
            { value: '350+', label: 'Projects delivered' },
            { value: '20+', label: 'Years of expertise' },
            { value: copy.hero.statValue, label: copy.hero.statLabel },
            { value: 'Fixed Price', label: 'Fixed pricing available' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5 px-6 py-6 text-center" style={{ backgroundColor: '#f9fafb' }}>
              <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
