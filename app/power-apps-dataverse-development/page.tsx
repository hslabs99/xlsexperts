import { marketServiceSchema, marketSiteOrigin } from '@/lib/seo'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { Navbar } from '@/components/navbar'
import { PowerAppsPageView } from '@/components/power-apps/power-apps-page-view'
import { POWER_APPS_HREF, powerAppsFaqs } from '@/lib/power-apps-page'

export async function generateMetadata() {
  return pageSeoMetadata(POWER_APPS_HREF)
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: powerAppsFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default async function PowerAppsDataverseDevelopmentPage() {
  const origin = await marketSiteOrigin()
  const seo = await getPageSeo(POWER_APPS_HREF)
  const serviceSchema = await marketServiceSchema({
    path: POWER_APPS_HREF,
    name: 'Microsoft Power Apps & Dataverse Development',
    description:
      'Custom Microsoft Power Apps and Dataverse development. Extend Dynamics 365, Microsoft 365 and existing Microsoft environments with purpose-built business applications.',
    serviceType: 'Microsoft Power Apps and Dataverse Development',
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
        name: 'Microsoft Power Apps & Dataverse',
        item: `${origin}${POWER_APPS_HREF}`,
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
      <PowerAppsPageView h1={seo.h1} heroIntro={seo.heroIntro} />
    </>
  )
}
