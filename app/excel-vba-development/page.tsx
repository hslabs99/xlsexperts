import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { SolutionCrossLinks } from '@/components/solutions/solution-cross-links'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Excel VBA Development New Zealand | XLS Experts',
  description:
    'Professional Excel VBA development for New Zealand businesses. Custom macros, automated workflows and purpose-built VBA applications that eliminate manual work and reduce errors.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/excel-vba-development' },
  openGraph: {
    title: 'Excel VBA Development New Zealand | XLS Experts',
    description: 'Custom Excel VBA development for NZ businesses. Automate workflows, eliminate manual work and build robust applications on the Excel platform.',
    url: 'https://www.xlsexperts.co.nz/excel-vba-development',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'Staff spending hours on repetitive copy-paste tasks every week',
  'Reports that require manual steps across multiple sheets or files',
  'Processes that depend on one person who knows "how the spreadsheet works"',
  'Data entry errors caused by unprotected inputs and no validation',
  'Excel files that run slowly because formulas are recalculating everything',
  'No way to generate documents, emails or exports automatically from Excel',
]

const steps = [
  {
    number: '01',
    title: 'Discovery and scoping',
    points: ['Map the current manual process end to end', 'Identify data sources, outputs and edge cases', 'Define what "done" looks like — and what success means'],
    deliverable: 'Scope document with features, assumptions and timeline.',
  },
  {
    number: '02',
    title: 'Development and testing',
    points: ['Working build delivered early for your team to test with real data', 'Iterative refinement based on feedback', 'Error handling, logging and edge case coverage built in'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Handover and support',
    points: ['Clean, commented VBA code', 'User guide and technical documentation', 'Training for power users if needed', 'Support and enhancement path available'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What can Excel VBA actually automate?', a: 'VBA can automate almost any task you perform manually in Excel — data imports and exports, report generation, formatting, emailing, file management, form processing, PDF creation and integration with other Office applications like Word and Outlook.' },
  { q: 'Is VBA still worth investing in, or should we use Python instead?', a: 'VBA is the right choice when the solution lives in Excel and your team works in Excel. It requires no additional software, runs inside the file, and your team can operate it without any technical knowledge. Python is better suited to server-side automation, large data volumes or integration with systems outside Office.' },
  { q: 'How long does a VBA project typically take?', a: 'Simple automation macros can be delivered in a day or two. A full VBA application — with a user interface, validation, error handling and documentation — typically takes two to four weeks.' },
  { q: 'Will the VBA work on our company computers?', a: 'We develop and test against your specific Excel version and security settings. If your organisation restricts macros, we work with your IT team to ensure proper signing and trust configuration.' },
  { q: 'Can you take over VBA code someone else wrote?', a: 'Yes. Code reviews and takeovers are a regular part of our work. We will assess the existing code, identify issues and either refactor what is there or rebuild the solution cleanly depending on what makes more sense.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Excel VBA Development',
  description: 'Professional Excel VBA development for New Zealand businesses. Custom macros, automated workflows and purpose-built VBA applications.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/excel-vba-development',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Excel VBA Development',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function ExcelVBADevelopmentPage() {
  const exampleTiles = await getServicePageTiles('/excel-vba-development')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Excel VBA Development</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Stop doing manually what Excel can do automatically.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              VBA is Excel&apos;s built-in programming language — and in the right hands it transforms repetitive, error-prone manual processes into reliable automated workflows. We build VBA solutions for New Zealand businesses that save time, reduce errors and run consistently without technical knowledge.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Problems we solve with VBA</h2>
            <p className="mb-12 text-center text-gray-500">The manual processes that are costing your team hours every week.</p>
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
          heading="VBA projects we have delivered in NZ"
          subheading="A sample of real automation work across New Zealand industries."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From brief to delivered automation.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Excel VBA developers serving all of New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">Our Excel VBA developers work with businesses across New Zealand — from large enterprises in Auckland and Wellington to growing SMEs in Christchurch, Hamilton, Tauranga and regional centres. Most VBA projects are scoped and delivered remotely. We have delivered automation solutions across finance, insurance, energy, construction, logistics and healthcare sectors.</p>
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

        <SolutionCrossLinks
          links={[
            {
              href: '/solutions/spreadsheet-process-modernisation',
              label: 'Spreadsheet & Process Modernisation',
            },
            {
              href: '/solutions/workflow-automation-systems-integration',
              label: 'Workflow Automation & Systems Integration',
            },
          ]}
        />

        <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to automate your Excel processes?</h2>
            <p className="mb-8 text-white/80">Tell us what you are doing manually and we will show you how to automate it.</p>
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
