import type { Metadata } from 'next'
import { marketServiceSchema, marketSiteOrigin } from '@/lib/seo'
import { getMarket } from '@/lib/market-server'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { faqPageJsonLd, toSolutionFaqs } from '@/lib/page-seo-faqs'
import { Navbar } from '@/components/navbar'
import { WebApplicationsPageView } from '@/components/web-applications/web-applications-page-view'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata('/web-applications')
}

export default async function WebApplicationsPage() {
  const origin = await marketSiteOrigin()
  const market = await getMarket()
  const seo = await getPageSeo('/web-applications')
  const faqSchema = faqPageJsonLd(seo.faqs)
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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <WebApplicationsPageView
        h1={seo.h1}
        heroIntro={seo.heroIntro}
        faqs={toSolutionFaqs(seo.faqs)}
        market={market}
      />
    </>
  )
}
