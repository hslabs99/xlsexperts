import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SolutionPageView } from '@/components/solutions/solution-page-view'
import {
  SITE_ORIGIN,
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

  return {
    title: solution.metaTitle,
    description: solution.metaDescription,
    alternates: { canonical: `${SITE_ORIGIN}${solution.href}` },
    openGraph: {
      title: `${solution.metaTitle} | XLS Experts`,
      description: solution.metaDescription,
      url: `${SITE_ORIGIN}${solution.href}`,
      images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    },
  }
}

export default async function SolutionSlugPage({ params }: PageProps) {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)
  if (!solution) notFound()
  return <SolutionPageView solution={solution} />
}
