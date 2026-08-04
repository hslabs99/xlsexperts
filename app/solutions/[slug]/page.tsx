import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SolutionPageView } from '@/components/solutions/solution-page-view'
import {
  getSolutionBySlug,
  solutionSlugs,
} from '@/lib/solutions'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'

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
  const seo = await getPageSeo(solution.href)
  return (
    <SolutionPageView
      solution={{
        ...solution,
        heroHeading: seo.h1 || solution.heroHeading,
        heroIntroduction: seo.heroIntro || solution.heroIntroduction,
        metaTitle: seo.metaTitle || solution.metaTitle,
        metaDescription: seo.metaDescription || solution.metaDescription,
      }}
    />
  )
}
