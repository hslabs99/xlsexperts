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
import { getHeroTopBulletTexts } from '@/lib/hero-top-bullets-server'
import { marketLocalBusinessSchema, marketPageMetadata } from '@/lib/seo'
import { HomepageSeoLinks } from '@/components/homepage-seo-links'

/** Market is chosen from host / localhost cookie — never share one cached `/` across NZ, UK, and International. */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getMarketCopy()
  return marketPageMetadata({
    path: '/',
    title: copy.home.metaTitle,
    description: copy.home.metaDescription,
  })
}

export default async function Page() {
  const copy = await getMarketCopy()
  const [heroTrust, backgroundHoldSeconds, topBullets] = await Promise.all([
    getHeroTrustContent(),
    getHeroBackgroundHoldSeconds(),
    getHeroTopBulletTexts(),
  ])

  const localBusinessSchema = await marketLocalBusinessSchema()

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
      <HomepageSeoLinks />
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
        <Hero
          trust={heroTrust}
          backgroundHoldSeconds={backgroundHoldSeconds}
          topBullets={topBullets}
        />
        <Services />
        <HowWeWork />
        <CaseStudiesSection />
        <About />
        <Contact />
      </main>
    </>
  )
}
