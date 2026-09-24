import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SolutionPageView } from '@/components/solutions/solution-page-view'
import {
  getSolutionBySlug,
  solutionSlugs,
} from '@/lib/solutions'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { regionalizeValue, toSolutionFaqs } from '@/lib/page-seo-faqs'
import { getMarket } from '@/lib/market-server'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)
  if (!solution) return {}
  return pageSeoMetadata(solution.href)
}

export default async function SolutionSlugPage({ params }: PageProps) {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)
  if (!solution) notFound()
  const market = await getMarket()
  const localized = regionalizeValue(solution, market)
  const seo = await getPageSeo(solution.href)
  return (
    <SolutionPageView
      solution={{
        ...localized,
        heroHeading: seo.h1 || localized.heroHeading,
        heroIntroduction: seo.heroIntro || localized.heroIntroduction,
        metaTitle: seo.metaTitle || localized.metaTitle,
        metaDescription: seo.metaDescription || localized.metaDescription,
        faqs: seo.faqs.length > 0 ? toSolutionFaqs(seo.faqs) : localized.faqs,
      }}
    />
  )
}
