import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageContact } from '@/components/page-contact'
import { industryIcons } from '@/components/industries/industry-icons'
import {
  ALL_INDUSTRIES_HREF,
  industryPages,
  presentIndustryText,
} from '@/lib/industries'
import { getMarket, getSiteOrigin } from '@/lib/market-server'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata(ALL_INDUSTRIES_HREF)
}

export default async function IndustriesIndexPage() {
  const market = await getMarket()
  const origin = (await getSiteOrigin()).replace(/\/+$/, '')
  const seo = await getPageSeo(ALL_INDUSTRIES_HREF)
  const say = (text: string) => presentIndustryText(text, market)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'XLS Experts industries',
    itemListElement: industryPages.map((industry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: industry.name,
      url: `${origin}${industry.href}`,
    })),
  }

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
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="pt-16">
        <section
          className="relative overflow-hidden py-20 sm:py-24"
          style={{
            background:
              'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
          }}
        >
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Industries
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-white text-balance md:text-5xl">
              {seo.h1}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              {say(seo.heroIntro)}
            </p>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {industryPages.map((industry) => {
              const Icon = industryIcons[industry.icon]
              return (
                <article
                  key={industry.href}
                  className="flex flex-col rounded-2xl border border-gray-200 p-6"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: '#e8f5ee' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: '#1a6b3c' }} aria-hidden="true" />
                  </div>
                  <h2 className="font-display mt-4 text-lg font-bold text-gray-900">
                    {industry.navLabel}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                    {say(industry.seo[market].introLead)}
                  </p>
                  <Link
                    href={industry.href}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#1a6b3c] underline-offset-2 hover:underline"
                  >
                    Explore
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        <PageContact topicHref={ALL_INDUSTRIES_HREF} showIndustryLinks={false} />
      </main>
    </>
  )
}
