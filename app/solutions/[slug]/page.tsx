import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SolutionPageView } from '@/components/solutions/solution-page-view'
import { marketPageMetadata } from '@/lib/seo'
import {
  getSolutionBySlug,
  solutionSlugs,
} from '@/lib/solutions'

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

  return marketPageMetadata({
    path: solution.href,
    title: solution.metaTitle,
    description: solution.metaDescription,
    ogTitle: `${solution.metaTitle} | XLS Experts`,
  })
}

export default async function SolutionSlugPage({ params }: PageProps) {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)
  if (!solution) notFound()
  return <SolutionPageView solution={solution} />
}
