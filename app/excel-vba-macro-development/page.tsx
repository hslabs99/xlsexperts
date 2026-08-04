import type { Metadata } from 'next'
import { marketServiceSchema } from '@/lib/seo'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { SolutionCrossLinks } from '@/components/solutions/solution-cross-links'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

const PAGE_HREF = '/excel-vba-macro-development'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata('/excel-vba-macro-development')
}

const problems = [
  'Staff spending hours on repetitive copy-paste, formatting or report steps every week',
  'Reports that require a remembered sequence of manual steps across sheets or files',
  'Macros recorded years ago that nobody understands, trusts or can safely change',
  'Processes that depend on one person who knows how the spreadsheet works',
  'Slow workbooks full of volatile formulas that a macro could replace',
  'No reliable way to generate documents, emails, PDFs or exports automatically from Excel',
]

const steps = [
  {
    number: '01',
    title: 'Discovery and scoping',
    points: [
      'Map the current manual process end to end',
      'Identify inputs, outputs, triggers and edge cases',
      'Agree what “done” looks like — button, shortcut or automatic run',
    ],
    deliverable:
      'Scope document with features, assumptions, trigger and timeline.',
  },
  {
    number: '02',
    title: 'Build and test',
    points: [
      'Macro or VBA solution written with clear structure and error handling',
      'Tested with your real data, including exceptions',
      'Button, keyboard shortcut or automatic trigger configured',
    ],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Handover and support',
    points: [
      'Clean, commented code and plain-English user notes',
      'Guidance on macro security settings for your environment',
      'Training for power users if needed, plus a support path',
    ],
    deliverable: null,
  },
]

const faqs = [
  {
    q: 'Are Excel macros and VBA the same thing?',
    a: 'Yes in practice. A macro is a sequence of automated actions in Excel; VBA (Visual Basic for Applications) is the programming language those macros are written in. Whether you call it a macro or a VBA project, we build the right level of automation — from a simple one-click process to a full application with validation, logging and documentation.',
  },
  {
    q: 'What can Excel VBA / macros actually automate?',
    a: 'Almost any task you perform manually in Excel — data imports and exports, report formatting, emailing, file management, form processing, PDF creation, consolidating multiple files, and integration with Word and Outlook.',
  },
  {
    q: 'Is VBA still worth investing in, or should we use Python instead?',
    a: 'VBA is the right choice when the solution lives in Excel and your team works in Excel. It requires no additional software, runs inside the file, and your team can operate it without technical knowledge. Python is better suited to server-side automation, large data volumes or integration with systems outside Office.',
  },
  {
    q: 'Are macros safe to use in a business environment?',
    a: 'Yes, when written correctly. We write signed macros and configure trust settings properly so they run without disruptive security warnings. We follow security best practices and never use macros to access data outside the intended scope.',
  },
  {
    q: 'Can you take over or improve macros someone else wrote?',
    a: 'Yes. Code reviews and takeovers are a regular part of our work. We assess the existing code, document what it does, fix bugs and either refactor what is there or rebuild cleanly depending on what makes more sense.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'Simple automation macros can be delivered in a day or two. A fuller VBA application — with a user interface, validation, error handling and documentation — typically takes two to four weeks.',
  },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: PAGE_HREF,
    name: 'Excel VBA/Macro Development',
    description:
      'Excel VBA and macro development for New Zealand businesses. Custom macros and VBA applications that automate repetitive work and reduce errors.',
  })
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default async function ExcelVbaMacroDevelopmentPage() {
  const seo = await getPageSeo('/excel-vba-macro-development')
  const serviceSchema = await buildServiceSchema()
  const exampleTiles = await getServicePageTiles(PAGE_HREF)
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
      <Navbar />

      <main className="pt-16">
        <section
          className="relative overflow-hidden py-24"
          style={{
            background:
              'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Excel VBA/Macro Development
            </span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              {seo.h1}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              {seo.heroIntro}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
            >
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              Problems we solve with macros and VBA
            </h2>
            <p className="mb-12 text-center text-gray-500">
              The manual Excel processes that are costing your team hours every
              week.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p) => (
                <div
                  key={p}
                  className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" />
                  <p className="text-sm leading-relaxed text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicePageExamples
          heading="VBA and macro projects we have delivered in NZ"
          subheading="A sample of real automation work across New Zealand industries."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              How we work
            </h2>
            <p className="mb-12 text-center text-gray-500">
              From brief to a reliable button your team can trust.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-7 shadow-sm"
                >
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#1a6b3c' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-display mb-4 text-lg font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <ul className="space-y-2">
                    {step.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  {step.deliverable && (
                    <p className="mt-4 rounded-lg bg-[#e8f5ee] px-3 py-2 text-xs font-medium text-[#1a6b3c]">
                      Deliverable: {step.deliverable}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
              Excel VBA and macro development across New Zealand
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We work with businesses across New Zealand — from large
              enterprises in Auckland and Wellington to growing SMEs in
              Christchurch, Hamilton, Tauranga and regional centres. Most
              projects are scoped and delivered remotely. Our macros and VBA
              solutions are used across finance, insurance, energy,
              construction, logistics, government, retail and healthcare.
            </p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-gray-200 p-6">
                  <h3 className="font-display mb-2 font-bold text-gray-900">
                    {faq.q}
                  </h3>
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
            {
              href: '/solutions/workflow-automation-systems-integration',
              label: 'Workflow Automation & Systems Integration',
            },
          ]}
        />

        <section
          className="py-16 text-center"
          style={{ backgroundColor: '#1a6b3c' }}
        >
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">
              Ready to automate your Excel processes?
            </h2>
            <p className="mb-8 text-white/80">
              Tell us what you are doing manually and we will show you how to
              automate it with a macro or VBA solution.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50"
            >
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
