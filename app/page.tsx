import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { HowWeWork } from '@/components/how-we-work'
import { CaseStudiesSection } from '@/components/case-studies-section'
import { About } from '@/components/about'
import { Contact } from '@/components/contact'

/** Cache homepage (incl. case-study snapshot) briefly — admin “Publish homepage” is the source of truth. */
export const revalidate = 120

export const metadata: Metadata = {
  title: {
    absolute: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
  },
  description:
    'XLS Experts are New Zealand\'s leading Excel and spreadsheet consultants. We build VBA automation, dashboards, financial models, and workflow automation tools for NZ businesses.',
  alternates: {
    canonical: 'https://www.xlsexperts.co.nz',
  },
  openGraph: {
    title: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    description:
      'New Zealand\'s leading Excel consultants. VBA automation, dashboards, financial modelling, and workflow automation.',
    url: 'https://www.xlsexperts.co.nz',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'XLS Experts',
  description:
    'New Zealand\'s leading Excel and spreadsheet consulting firm. We provide VBA automation, dashboard development, financial modelling, Power Query, and workflow automation services.',
  url: 'https://www.xlsexperts.co.nz',
  logo: 'https://www.xlsexperts.co.nz/images/xls-experts-logo.png',
  areaServed: {
    '@type': 'Country',
    name: 'New Zealand',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NZ',
    addressLocality: 'Auckland',
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
  sameAs: [
    'https://www.xlsexperts.co.nz',
  ],
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
      name: 'How much does Excel consulting cost in New Zealand?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'XLS Experts projects typically start from $1,000 NZD for small automation tasks. Most projects fall in the $2,000–$10,000 range depending on complexity. We provide a clear scope and fixed price before starting any work.',
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
        text: 'XLS Experts works with businesses across finance, insurance, energy, healthcare, construction, logistics, retail, hospitality, education, and not-for-profit sectors throughout New Zealand.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with businesses outside Auckland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We work with businesses across all of New Zealand including Wellington, Christchurch, Hamilton, Tauranga, and other regions. Most project work can be delivered remotely.',
      },
    },
  ],
}

export default function Page() {
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
        <Hero />
        <Services />
        <HowWeWork />
        <CaseStudiesSection />
        <About />
        <Contact />
      </main>
    </>
  )
}
