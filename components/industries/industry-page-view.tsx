import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageContact } from '@/components/page-contact'
import { Breadcrumbs } from '@/components/solutions/breadcrumbs'
import { SolutionCTA } from '@/components/solutions/solution-cta'
import { solutionFaqJsonLd } from '@/components/solutions/solution-faq'
import { industryIcons } from '@/components/industries/industry-icons'
import type { CaseStudy } from '@/lib/types'
import type { MarketId } from '@/lib/market'
import type { PageSeoFields } from '@/lib/page-seo'
import {
  ALL_INDUSTRIES_HREF,
  complianceFor,
  labelForHref,
  presentIndustryText,
  proofLineFor,
  relatedLinksFor,
  sectorMatchesIndustry,
  toolsFor,
  type IndustryPage,
} from '@/lib/industries'
import { getMarketCopy } from '@/lib/market-server'
import { localBusinessForMarket } from '@/lib/regions'
import { toSolutionFaqs } from '@/lib/page-seo-faqs'

type IndustryPageViewProps = {
  industry: IndustryPage
  market: MarketId
  seo: PageSeoFields
  studies: CaseStudy[]
}

export async function IndustryPageView({
  industry,
  market,
  seo,
  studies,
}: IndustryPageViewProps) {
  const copy = await getMarketCopy()
  const origin = copy.site.origin.replace(/\/+$/, '')
  const local = localBusinessForMarket(market)
  const say = (text: string) => presentIndustryText(text, market)
  const Icon = industryIcons[industry.icon]
  const tools = toolsFor(industry, market)
  const compliance = complianceFor(industry, market)
  const proof = proofLineFor(market)
  const related = relatedLinksFor(industry)
  const matchedStudies = studies.filter((study) =>
    sectorMatchesIndustry(industry, study.sector),
  )
  const faqs = toSolutionFaqs(seo.faqs).map((faq) => ({
    question: say(faq.question),
    answer: say(faq.answer),
  }))
  const extraLinks = (industry.extraLinks ?? []).filter((link) =>
    link.markets.includes(market),
  )
  const paragraphs = say(industry.intro)
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Industries',
        item: `${origin}${ALL_INDUSTRIES_HREF}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: industry.name,
        item: `${origin}${industry.href}`,
      },
    ],
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: seo.h1 || industry.name,
    description: seo.metaDescription,
    provider: {
      '@type': 'ProfessionalService',
      name: 'XLS Experts',
      url: origin,
      areaServed: { '@type': 'Country', name: local.areaServedName },
      ...(local.telephone ? { telephone: local.telephone } : {}),
    },
    url: `${origin}${industry.href}`,
    areaServed: { '@type': 'Country', name: local.areaServedName },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: industry.name,
    },
    serviceType: industry.name,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(solutionFaqJsonLd(faqs)),
          }}
        />
      ) : null}
      <Navbar />
      <main className="pt-16">
        <section
          className="relative overflow-hidden py-16 sm:py-20"
          style={{
            background:
              'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
          }}
        >
          <div className="relative mx-auto max-w-4xl px-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Industries', href: ALL_INDUSTRIES_HREF },
                { label: industry.name },
              ]}
            />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-white text-balance md:text-5xl">
              {seo.h1 || industry.name}
            </h1>
            {seo.heroIntro ? (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
                {seo.heroIntro}
              </p>
            ) : null}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              {proof}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-md transition-colors hover:bg-gray-50"
              >
                Book a free discovery call
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {matchedStudies.length > 0 ? (
                <a
                  href="#relevant-work"
                  className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See case studies
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl space-y-5 px-6 text-base leading-relaxed text-gray-700">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="bg-[#f6f7f4] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-center text-3xl font-bold text-gray-900">
              {say(`Challenges we see in ${industry.name.toLowerCase()}`)}
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {industry.challenges.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-700"
                >
                  {say(item)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-center text-3xl font-bold text-gray-900">
              How we help
            </h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {industry.solutions.map((item) => (
                <li key={item.href + item.title}>
                  <Link
                    href={item.href}
                    className="flex h-full flex-col rounded-xl border border-gray-200 p-6 transition-colors hover:border-[#1a6b3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
                  >
                    <span className="font-display text-lg font-bold text-gray-900">
                      {say(item.title)}
                    </span>
                    <span className="mt-3 text-sm font-semibold text-[#1a6b3c]">
                      {labelForHref(item.href)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-[#e8f5ee] py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-center text-3xl font-bold text-gray-900">
              {say(industry.ai.heading)}
            </h2>
            <p className="mt-4 text-center text-base leading-relaxed text-gray-700">
              {say(industry.ai.intro)}
            </p>
            <ul className="mt-8 space-y-3">
              {industry.ai.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded-lg bg-white px-5 py-4 text-sm leading-relaxed text-gray-700"
                >
                  {say(bullet)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20" aria-label={industry.name}>
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              Systems we connect
            </h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-2">
              {tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  {tool}
                </li>
              ))}
            </ul>
            {compliance ? (
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-600">
                {compliance}
              </p>
            ) : null}
          </div>
        </section>

        {matchedStudies.length > 0 ? (
          <section id="relevant-work" className="scroll-mt-24 bg-[#f6f7f4] py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="font-display text-center text-3xl font-bold text-gray-900">
                Relevant work
              </h2>
              <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {matchedStudies.map((study) => (
                  <li key={study.slug}>
                    <Link
                      href={`/case-studies/${study.slug}`}
                      className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-[#1a6b3c]"
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: '#1a6b3c' }}
                      >
                        {study.sector}
                      </p>
                      <h3 className="font-display mt-2 text-base font-bold text-gray-900">
                        {study.title}
                      </h3>
                      {study.client ? (
                        <p className="mt-1 text-sm text-gray-500">{study.client}</p>
                      ) : null}
                      {study.outcome ? (
                        <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                          {study.outcome}
                        </p>
                      ) : null}
                      <span className="mt-5 text-sm font-semibold text-[#1a6b3c]">
                        Read case study
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-center text-3xl font-bold text-gray-900">
              Related services and solutions
            </h2>
            <ul className="mt-8 space-y-3">
              {related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-[#1a6b3c] underline-offset-2 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {extraLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-[#1a6b3c] underline-offset-2 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {faqs.length > 0 ? (
          <section className="bg-[#f6f7f4] py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-6">
              <h2 className="font-display mb-8 text-center text-3xl font-bold text-gray-900">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >
                    <summary className="cursor-pointer font-display font-bold text-gray-900">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <SolutionCTA
          heading={say(industry.ctaHeading)}
          body={proof}
          href="#contact"
          label="Book a free discovery call"
        />
        <PageContact topicHref={industry.href} showIndustryLinks={false} />
      </main>
    </>
  )
}
