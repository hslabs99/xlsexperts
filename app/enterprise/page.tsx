import type { Metadata } from 'next'
import { marketPageMetadata, marketServiceSchema } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { EnterprisePageView } from '@/components/enterprise/enterprise-page-view'
import { enterpriseFaqs } from '@/lib/enterprise-page'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/enterprise',
    title: 'Excel in Enterprise Operational Applications',
    description:
      'Governed enterprise Excel applications for New Zealand organisations. Pricing, forecasting, project controls, ERP extensions, documentation, UAT and long-term support—without replacing your core platforms.',
    ogTitle: 'Excel in Enterprise Operational Applications | XLS Experts',
    ogDescription:
      'Turn spreadsheets into governed Excel applications your teams can rely on. Enterprise Excel consulting for SAP, JD Edwards, Simpro and Microsoft 365 environments across New Zealand.',
    ogImage: '/images/enterprise-hero.png',
  })
}

async function buildServiceSchema() {
  return marketServiceSchema({
    path: '/enterprise',
    name: 'Excel in Enterprise Operational Applications',
    description:
      'Design and development of governed Excel-based operational applications for enterprise organisations. Includes pricing tools, forecasting models, reporting automation, project controls, ERP extensions and hybrid architectures.',
    serviceType: 'Enterprise Excel Applications',
  })
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: enterpriseFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default async function EnterprisePage() {
  const serviceSchema = await buildServiceSchema()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <EnterprisePageView />
    </>
  )
}
