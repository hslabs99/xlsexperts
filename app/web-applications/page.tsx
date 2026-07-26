import type { Metadata } from 'next'
import { marketPageMetadata, marketServiceSchema, marketSiteOrigin } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { WebApplicationsPageView } from '@/components/web-applications/web-applications-page-view'
import { webAppFaqs } from '@/lib/web-applications-page'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/web-applications',
    title: 'Web Application Development NZ | Custom Business Apps | XLS Experts',
    description:
      'Custom web application development for New Zealand businesses. Build secure, multi-user cloud applications, customer portals, business systems and SaaS platforms.',
    ogTitle: 'Web Application Development NZ | Custom Business Apps | XLS Experts',
    ogDescription:
      'Secure, multi-user cloud applications, customer portals, business systems and SaaS platforms—built with practical business-process understanding.',
    robots: { index: true, follow: true },
  })
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
      <WebApplicationsPageView />
    </>
  )
}
