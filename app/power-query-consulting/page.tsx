import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Power Query Consulting New Zealand | XLS Experts',
  description:
    'Expert Power Query consulting for New Zealand businesses. We build automated data pipelines in Excel and Power BI that eliminate manual data preparation and keep your reports always current.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/power-query-consulting' },
  openGraph: {
    title: 'Power Query Consulting New Zealand | XLS Experts',
    description: 'Expert Power Query consulting for NZ businesses. Automated data pipelines that eliminate manual data preparation.',
    url: 'https://www.xlsexperts.co.nz/power-query-consulting',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'Data from multiple systems pasted together manually every week before reporting can begin',
  'Inconsistent column names, date formats and data types causing formula errors',
  'Hours spent cleaning the same messy export from the same system every month',
  'Reports that cannot refresh until someone manually runs the data preparation process',
  'No record of what transformations were applied — just "it works, don\'t touch it"',
  'Pivot tables and charts that update correctly only when data is structured perfectly',
]

const steps = [
  {
    number: '01',
    title: 'Data source review',
    points: ['Understand the source systems and export formats', 'Identify the transformations required', 'Map the output structure needed for reporting or analysis'],
    deliverable: 'Data transformation spec with connection approach and step outline.',
  },
  {
    number: '02',
    title: 'Query build and testing',
    points: ['Queries built using best practices — no hard-coded paths or fragile steps', 'Tested with representative data including edge cases and blanks', 'Refresh tested on your environment'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Documentation and handover',
    points: ['Annotated query steps for future maintenance', 'Refresh instructions for your team', 'Training available on editing queries for minor changes'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What is Power Query and what can it do?', a: 'Power Query is a data transformation tool built into Excel and Power BI. It connects to data sources, applies cleaning and transformation steps, and loads structured data ready for analysis. It replaces manual data preparation with a repeatable, one-click refresh process.' },
  { q: 'What data sources can Power Query connect to?', a: 'Power Query connects to Excel files, CSV files, SQL Server, Oracle, MySQL, PostgreSQL, SharePoint, OneDrive, web pages, APIs, Azure services, Salesforce and many more. If you have a data source, we can usually connect to it.' },
  { q: 'Can Power Query replace VBA for data import tasks?', a: 'For many data import and transformation tasks, yes. Power Query is often faster to build and easier to maintain than VBA for ETL-style work. We will advise on the right approach based on your specific requirements — sometimes a combination of Power Query and VBA is optimal.' },
  { q: 'Does Power Query work in our version of Excel?', a: 'Power Query is built into Excel 2016 and later, and all Microsoft 365 versions. For Excel 2010 and 2013 it can be installed as a free add-in. We confirm compatibility before starting any engagement.' },
  { q: 'How much does Power Query consulting cost in New Zealand?', a: 'A straightforward data connection and transformation project typically starts from $1,000 NZD. More complex multi-source pipelines with automated refresh and documentation are typically $2,000 to $6,000 NZD. We provide a fixed quote after reviewing your data sources.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Power Query Consulting',
  description: 'Expert Power Query consulting for New Zealand businesses. Automated data pipelines that eliminate manual data preparation.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/power-query-consulting',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Power Query Consulting',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function PowerQueryConsultingPage() {
  const exampleTiles = await getServicePageTiles('/power-query-consulting')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Power Query Consulting</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Stop preparing data. Start analysing it.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Most NZ businesses spend far too much time getting data ready and not enough time using it. Power Query is built into Excel and Power BI specifically to automate that preparation — connecting to your data sources, cleaning and transforming the data, and keeping your reports refreshed automatically.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Data preparation problems we eliminate</h2>
            <p className="mb-12 text-center text-gray-500">The manual data work Power Query removes from your team&apos;s week.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p) => (
                <div key={p} className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" />
                  <p className="text-sm leading-relaxed text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicePageExamples
          heading="Power Query projects we have delivered"
          subheading="Data pipeline and transformation work for New Zealand organisations."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From messy data sources to clean, refreshable pipelines.</p>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-gray-200 bg-gray-50 p-7 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#1a6b3c' }}>{step.number}</div>
                  <h3 className="font-display mb-4 text-lg font-bold text-gray-900">{step.title}</h3>
                  <ul className="space-y-2">
                    {step.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />{p}
                      </li>
                    ))}
                  </ul>
                  {step.deliverable && <p className="mt-4 rounded-lg bg-[#e8f5ee] px-3 py-2 text-xs font-medium text-[#1a6b3c]">Deliverable: {step.deliverable}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Power Query consulting across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We provide Power Query consulting to businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and beyond. Power Query work is delivered entirely remotely. We work with businesses across finance, retail, logistics, manufacturing, healthcare and professional services who use Excel or Power BI for reporting and analysis.</p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-gray-200 p-6">
                  <h3 className="font-display mb-2 font-bold text-gray-900">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to automate your data preparation?</h2>
            <p className="mb-8 text-white/80">Tell us what data you are preparing manually and we will show you how Power Query can handle it.</p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
