import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IndustryPageView } from '@/components/industries/industry-page-view'
import { getCaseStudyCatalogue } from '@/lib/case-studies-pages'
import { getIndustryBySlug, industryPages } from '@/lib/industries'
import { getMarket } from '@/lib/market-server'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return industryPages.map((page) => ({ slug: page.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) notFound()
  return pageSeoMetadata(industry.href)
}

export default async function IndustrySlugPage({ params }: PageProps) {
  const { slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) notFound()
  const market = await getMarket()
  const seo = await getPageSeo(industry.href)
  return (
    <IndustryPageView
      industry={industry}
      market={market}
      seo={seo}
      studies={getCaseStudyCatalogue().items}
    />
  )
}
