import type { Metadata } from 'next'
import { marketServiceSchema } from '@/lib/seo'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { SolutionCrossLinks } from '@/components/solutions/solution-cross-links'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata('/excel-spreadsheet-development')
}

const problems = [
  'Spreadsheets that break when someone adds a row or changes a formula',
  'Multiple versions of the same file circulating across teams',
  'Hours spent manually copying and pasting data between sheets',
  'No input validation — anyone can type anything anywhere',
  'Reports that take half a day to update instead of minutes',
  'Critical business logic locked in one person\'s head (or one cell)',
]

const steps = [
  {
    number: '01',
    title: 'Discovery',
    points: ['Understand the workflow and data sources', 'Map inputs, calculations and outputs', 'Identify the pain points and failure modes'],
    deliverable: 'Scope document with structure, features and timeline.',
  },
  {
    number: '02',
    title: 'Build and iterate',
    points: ['Working prototype delivered early', 'You test with real data, we refine', 'Full validation, error-trapping and formatting'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Handover',
    points: ['User guide and technical notes', 'Training session if required', 'Ongoing support available'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'How long does a custom spreadsheet take to build?', a: 'Most projects take one to three weeks depending on complexity. A simple tracker might be two or three days. A full reporting pack with multiple data sources and automated outputs is typically two to four weeks.' },
  { q: 'Can you improve an existing spreadsheet rather than build from scratch?', a: 'Yes. We regularly take over existing spreadsheets, restructure them for stability and performance, and add missing functionality. We will always advise whether a rebuild or enhancement is the better investment.' },
  { q: 'Will the spreadsheet work on our version of Excel?', a: 'We build to match your environment. If you are on Excel 2016, Microsoft 365 or a mixed environment, we test and confirm compatibility before delivery.' },
  { q: 'Do you work with businesses outside Auckland?', a: 'Yes. We work with businesses across New Zealand including Wellington, Christchurch, Hamilton and Tauranga. Most spreadsheet development is delivered remotely with video calls for discovery and review.' },
  { q: 'What happens if we need changes after delivery?', a: 'We provide a short support period after every project. For ongoing changes and enhancements, we offer a support retainer or quote individual change requests.' },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: '/excel-spreadsheet-development',
    name: 'Excel Spreadsheet Development',
    description: 'Custom Excel spreadsheet development for New Zealand businesses. Purpose-built spreadsheets that replace manual processes, reduce errors and scale with your business.',
  })
}


const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function ExcelSpreadsheetDevelopmentPage() {
  const seo = await getPageSeo('/excel-spreadsheet-development')
  const serviceSchema = await buildServiceSchema()
  const exampleTiles = await getServicePageTiles('/excel-spreadsheet-development')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Excel Spreadsheet Development</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              {seo.h1}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              {seo.heroIntro}
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Problems */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Common spreadsheet problems we fix</h2>
            <p className="mb-12 text-center text-gray-500">Sound familiar? These are the issues NZ businesses bring to us most often.</p>
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

        {/* Examples */}
        <ServicePageExamples
          heading="What we build for NZ businesses"
          subheading="Real examples of spreadsheet development projects delivered across New Zealand."
          tiles={exampleTiles}
        />

        {/* Process */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">A clear process from brief to delivery.</p>
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

        {/* Location */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Excel spreadsheet development across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We work with businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and beyond. Most projects are delivered remotely, with on-site visits available for Auckland-based clients. Whether you need a simple tracker or a complex multi-sheet reporting system, we scope and deliver to your timeline and budget.</p>
          </div>
        </section>

        {/* FAQs */}
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

        <SolutionCrossLinks
          links={[
            {
              href: '/ai-workflow-and-business-process-automation',
              label: 'AI Workflow and Business Process Automation',
            },
          ]}
        />

        {/* CTA */}
        <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to replace that problem spreadsheet?</h2>
            <p className="mb-8 text-white/80">Tell us what you are working with and we will scope a solution that fits your business.</p>
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
