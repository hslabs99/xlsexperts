import type { Metadata } from 'next'
import { marketServiceSchema, marketSiteOrigin } from '@/lib/seo'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { Navbar } from '@/components/navbar'
import { WebApplicationsPageView } from '@/components/web-applications/web-applications-page-view'
import { webAppFaqs } from '@/lib/web-applications-page'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata('/web-applications')
}


const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: webAppFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}


export default async function WebApplicationsPage() {
  const origin = await marketSiteOrigin()
  const seo = await getPageSeo('/web-applications')
  const serviceSchema = await marketServiceSchema({
    path: '/web-applications',
    name: 'Web Application Development',
    description:
      'Custom web application development—including business web applications, customer portals, field applications, hybrid Excel solutions and SaaS platforms.',
    serviceType: 'Web Application Development',
  })
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${origin}/services` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Web Applications',
        item: `${origin}/web-applications`,
      },
    ],
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <WebApplicationsPageView h1={seo.h1} heroIntro={seo.heroIntro} />
    </>
  )
}
