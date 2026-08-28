import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { HowWeWork } from '@/components/how-we-work'
import { CaseStudiesSection } from '@/components/case-studies-section'
import { About } from '@/components/about'
import { Contact } from '@/components/contact'
import { getMarketCopy, getHeroBackgroundHoldSeconds } from '@/lib/market-server'
import { getHeroTrustContent } from '@/lib/hero-trust-server'
import { SITE_ICONS } from '@/lib/site-icons'

/** Market is chosen from host / localhost cookie — never share one cached `/` across NZ, UK, and International. */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getMarketCopy()
  return {
    title: {
      absolute: copy.home.metaTitle,
    },
    description: copy.home.metaDescription,
    icons: SITE_ICONS,
    alternates: {
      canonical: copy.site.origin,
    },
    openGraph: {
      title: copy.home.metaTitle,
      description: copy.home.metaDescription,
      url: copy.site.origin,
      images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    },
  }
}

export default async function Page() {
  const copy = await getMarketCopy()
  const [heroTrust, backgroundHoldSeconds] = await Promise.all([
    getHeroTrustContent(),
    getHeroBackgroundHoldSeconds(),
  ])

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'XLS Experts',
    description: copy.home.schemaDescription,
    url: copy.site.origin,
    logo: `${copy.site.origin}/images/xls-experts-logo.png`,
    areaServed: {
      '@type': 'Country',
      name: copy.home.schemaAreaServed,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: copy.home.schemaAddressCountry,
      addressLocality: copy.home.schemaAddressLocality,
    },
    knowsAbout: [
      'Excel VBA development',
      'Spreadsheet automation',
      'Excel dashboard development',
      'Financial modelling',
      'Power Query',
      'Business process automation',
      'Excel consulting',
      'Data analysis',
    ],
    sameAs: [copy.site.origin],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does an Excel consultant do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An Excel consultant designs and builds custom spreadsheet solutions including VBA automation, dashboards, financial models, and data pipelines. They help businesses replace manual processes with reliable, automated tools that save time and reduce errors.',
        },
      },
      {
        '@type': 'Question',
        name: copy.home.faqCostQuestion,
        acceptedAnswer: {
          '@type': 'Answer',
          text: copy.home.faqCostAnswer,
        },
      },
      {
        '@type': 'Question',
        name: 'Can Excel connect to SQL databases?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Excel can connect directly to SQL Server, MySQL, PostgreSQL, Oracle, and other databases using Power Query or VBA with ADO. This eliminates manual data exports and keeps reports automatically up to date.',
        },
      },
      {
        '@type': 'Question',
        name: 'What industries do XLS Experts work with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: copy.home.faqIndustriesAnswer,
        },
      },
      {
        '@type': 'Question',
        name: copy.home.faqOutsideQuestion,
        acceptedAnswer: {
          '@type': 'Answer',
          text: copy.home.faqOutsideAnswer,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main>
        <Navbar />
        <Hero trust={heroTrust} backgroundHoldSeconds={backgroundHoldSeconds} />
        <Services />
        <HowWeWork />
        <CaseStudiesSection />
        <About />
        <Contact />
      </main>
    </>
  )
}
