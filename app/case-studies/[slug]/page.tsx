import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { caseStudyHeaderTone } from '@/components/case-study-summary-card'
import { IndustrySectorTag } from '@/components/industries/industry-sector-tag'
import { Navbar } from '@/components/navbar'
import { PageContact } from '@/components/page-contact'
import {
  getCaseStudyBySlug,
  getCaseStudyCatalogue,
  relatedLinksForCaseStudy,
} from '@/lib/case-studies-pages'
import { getMarket, getMarketCopy, getSiteOrigin } from '@/lib/market-server'
import { regionalizePublicCopy } from '@/lib/page-seo-faqs'
import { absoluteOnOrigin } from '@/lib/regions'
import { marketPathAlternates } from '@/lib/seo'
import { SITE_ICONS } from '@/lib/site-icons'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getCaseStudyCatalogue().items.map((item) => ({ slug: item.slug }))
}

export const dynamicParams = true

function metaDescription(sector: string, outcome: string): string {
  const lead = sector.trim() ? `${sector.trim()} case study. ` : 'Excel case study. '
  const text = `${lead}${outcome.trim()}`.replace(/\s+/g, ' ')
  if (text.length <= 160) return text
  return `${text.slice(0, 157).trim()}…`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  if (!study) notFound()

  const copy = await getMarketCopy()
  const market = await getMarket()
  const origin = await getSiteOrigin()
  const path = `/case-studies/${study.slug}`
  const description = regionalizePublicCopy(
    metaDescription(study.sector, study.outcome),
    market,
  )
  const title = `${regionalizePublicCopy(study.title, market)} – Case Study | ${copy.about.brandLabel}`
  const url = absoluteOnOrigin(origin, path)
  const imageUrl = study.image
    ? study.image.startsWith('http')
      ? study.image
      : `${origin}${study.image}`
    : undefined

  return {
    title: { absolute: title },
    description,
    icons: SITE_ICONS,
    alternates: await marketPathAlternates(path),
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: 'XLS Experts',
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: regionalizePublicCopy(study.title, market),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  if (!study) notFound()

  const copy = await getMarketCopy()
  const market = await getMarket()
  const origin = await getSiteOrigin()
  const say = (text: string) => regionalizePublicCopy(text, market)
  const path = `/case-studies/${study.slug}`
  const related = relatedLinksForCaseStudy(study)
  const publishedAt = getCaseStudyCatalogue().publishedAt
  const imageUrl = study.image
    ? study.image.startsWith('http')
      ? study.image
      : `${origin}${study.image}`
    : undefined

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: say(study.title),
    description: say(metaDescription(study.sector, study.outcome)),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(publishedAt ? { datePublished: publishedAt, dateModified: publishedAt } : {}),
    author: { '@type': 'Organization', name: 'XLS Experts' },
    publisher: {
      '@type': 'Organization', name: 'XLS Experts', url: origin,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteOnOrigin(origin, path),
    },
    about: study.sector ? say(study.sector) : undefined,
  }

  const catalogueIndex = getCaseStudyCatalogue().items.findIndex(
    (item) => item.slug === study.slug,
  )
  const tone = caseStudyHeaderTone(catalogueIndex < 0 ? 0 : catalogueIndex)
  const blocks = [
    { label: 'Problem', body: study.problem },
    { label: 'Solution', body: study.solution },
    { label: 'Outcome', body: study.outcome },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Navbar />
      <main className="min-h-screen bg-white">
        <article>
          <header
            className="border-b border-gray-100 py-14 sm:py-16"
            style={{ backgroundColor: '#e8f5ee' }}
          >
            <div className="mx-auto max-w-3xl px-6">
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All case studies
              </Link>
              <div className="relative mt-8 flex h-[300px] flex-col overflow-hidden border border-white/40 px-4 py-4 sm:h-[380px] sm:px-6 sm:py-5">
                {study.image ? (
                  <Image
                    src={study.image}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover object-center opacity-90"
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
                  className="relative flex flex-1 flex-col justify-end gap-3 rounded px-5 py-6 sm:px-7 sm:py-8"
                  style={{ backgroundColor: tone.backing }}
                >
                  {study.sector ? (
                    <IndustrySectorTag
                      sector={study.sector}
                      label={say(study.sector)}
                      className="text-xs font-semibold uppercase tracking-widest text-[#86efac]"
                    />
                  ) : null}
                  <h1 className="text-2xl font-bold text-white sm:text-4xl">
                    {say(study.title)}
                  </h1>
                  {study.client ? (
                    <span className="self-start rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                      {study.client}
                    </span>
                  ) : null}
                </div>
              </div>
              {copy.caseStudies.deliveryLine ? (
                <p className="mt-4 text-sm leading-relaxed text-gray-500">
                  {copy.caseStudies.deliveryLine}
                </p>
              ) : null}
            </div>
          </header>

          <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
            {blocks.map((block) =>
              block.body ? (
                <section key={block.label}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {block.label}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-gray-800">
                    {say(block.body)}
                  </p>
                </section>
              ) : null,
            )}

            {study.tags.length > 0 ? (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Technologies
                </h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {study.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      {say(tag)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {related.length > 0 ? (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Related services
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {related.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-semibold underline-offset-2 hover:underline"
                        style={{ color: '#1a6b3c' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section
              className="rounded-sm px-6 py-8 text-center"
              style={{ backgroundColor: '#1a6b3c' }}
            >
              <h2 className="text-2xl font-bold text-white">
                Want something similar?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/80">
                Tell us what you are doing manually and we will scope a practical
                Excel or spreadsheet solution.
              </p>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900"
              >
                Send an enquiry
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </section>
          </div>
        </article>
        <PageContact topicHref={path} />
      </main>
    </>
  )
}
