import type { Metadata } from 'next'
import { marketPageMetadata, marketServiceSchema } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { AiUseCasesPageView } from '@/components/ai-use-cases/ai-use-cases-page-view'
import { USE_CASES_HREF, useCasesPageMeta } from '@/lib/ai-use-cases-page'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: USE_CASES_HREF,
    title: useCasesPageMeta.title,
    description: useCasesPageMeta.description,
    ogTitle: useCasesPageMeta.ogTitle,
    ogDescription: useCasesPageMeta.ogDescription,
    keywords: [
      'A.I. Excel use cases',
      'Power Query A.I.',
      'VBA A.I. integration',
      'Excel A.I. commentary',
      'document extraction Excel',
      'A.I. classification Excel',
    ],
  })
}

async function buildServiceSchema() {
  return marketServiceSchema({
    path: USE_CASES_HREF,
    name: 'A.I. Use Cases for Excel, VBA and Power Query',
    description: useCasesPageMeta.description,
    serviceType: 'A.I. Excel Workflow Consulting',
  })
}

export default async function UseCasesPage() {
  const serviceSchema = await buildServiceSchema()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <AiUseCasesPageView />
    </>
  )
}
