import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Excel Macro Automation New Zealand | XLS Experts',
  description:
    'Excel macro automation services for New Zealand businesses. We write reliable, well-documented macros that automate repetitive tasks, reduce errors and free up your team\'s time.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/excel-macro-automation' },
  openGraph: {
    title: 'Excel Macro Automation New Zealand | XLS Experts',
    description: 'Expert Excel macro automation for NZ businesses. Reliable macros that automate repetitive tasks and free up your team.',
    url: 'https://www.xlsexperts.co.nz/excel-macro-automation',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'The same formatting and layout applied manually every week to every report',
  'Data pasted between sheets or files by hand — creating version and error risk',
  'Macros recorded by a staff member years ago that no one understands or trusts',
  'Slow workbooks full of volatile formulas that could be replaced with a macro',
  'No button to run the process — staff have to remember a sequence of steps',
  'Macro security warnings that prevent the automation from running at all',
]

const examples = [
  { tag: 'Reporting', title: 'Weekly KPI Report Formatter', detail: 'A single button formats incoming data, applies conditional formatting, generates charts and saves a timestamped PDF — replacing 45 minutes of weekly manual work.' },
  { tag: 'Data Processing', title: 'Multi-File Data Consolidator', detail: 'Macro opens all files in a folder, extracts specific data ranges, consolidates into a master sheet and applies cleaning rules automatically.' },
  { tag: 'Finance', title: 'Invoice Batch Processor', detail: 'Reads invoice data from a structured input sheet, generates individual formatted invoice files, saves them to client folders and logs each one in a register.' },
  { tag: 'Administration', title: 'Meeting Pack Generator', detail: 'Macro pulls agenda items, attendee data and action statuses from input sheets and assembles a formatted Word document ready for distribution.' },
]

const steps = [
  {
    number: '01',
    title: 'Process review',
    points: ['Walk through the exact manual steps', 'Identify inputs, outputs and exceptions', 'Agree what the macro needs to handle reliably'],
    deliverable: 'Clear spec with triggering mechanism, steps and expected outputs.',
  },
  {
    number: '02',
    title: 'Build and test',
    points: ['Macro written with clear structure and error handling', 'Tested with your real data including edge cases', 'Button, keyboard shortcut or automatic trigger set up'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Documentation and handover',
    points: ['Plain-English user notes', 'Code comments for future maintenance', 'Guidance on macro security settings for your environment'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What is the difference between a macro and a VBA project?', a: 'A macro is a recorded or written sequence of actions. VBA (Visual Basic for Applications) is the programming language those macros are written in. For simple repetitive tasks, a well-written macro is all you need. For complex applications with user interfaces, validation logic and multiple processes, a full VBA project is appropriate.' },
  { q: 'Can macros be triggered automatically?', a: 'Yes. Macros can run when a workbook opens, when a sheet is activated, when a cell changes, at a scheduled time (via Windows Task Scheduler combined with VBA), or at the click of a custom button.' },
  { q: 'Are macros safe to use in a business environment?', a: 'Yes, when written correctly. We write signed macros and configure trust settings properly so they run without disruptive security warnings in your environment. We follow security best practices and never use macros to access data outside the intended scope.' },
  { q: 'Can you fix or improve macros someone else wrote?', a: 'Yes. This is common — we regularly review existing macros, document what they do, fix bugs and refactor them to be more reliable and maintainable.' },
  { q: 'How much does macro automation cost in New Zealand?', a: 'Simple automation macros typically start from $500 to $1,500 NZD. More complex automation involving multiple processes, error handling and documentation is typically $1,500 to $5,000 NZD. We provide a fixed-price quote after a brief discovery call.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Excel Macro Automation',
  description: 'Excel macro automation for New Zealand businesses. Reliable, documented macros that automate repetitive tasks and free up your team.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/excel-macro-automation',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Excel Macro Automation',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default function ExcelMacroAutomationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Excel Macro Automation</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              One click to do what your team does in an hour.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Macros are one of the most cost-effective investments a New Zealand business can make in Excel. A well-written macro turns a 45-minute manual process into a single button press — reliably, every time, without errors.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Macro problems we fix</h2>
            <p className="mb-12 text-center text-gray-500">Common Excel macro issues across NZ businesses.</p>
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

        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Macro automation examples</h2>
            <p className="mb-12 text-center text-gray-500">Real projects delivered for New Zealand organisations.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {examples.map((ex) => (
                <div key={ex.title} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                  <span className="mb-3 inline-block rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">{ex.tag}</span>
                  <h3 className="font-display mb-2 text-lg font-bold text-gray-900">{ex.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{ex.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">Fast, clear delivery from brief to button.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Excel macro automation across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We provide Excel macro automation services to businesses throughout New Zealand. Whether you are in Auckland, Wellington, Christchurch, Hamilton or a regional centre, we can scope, build and deliver macro automation remotely. Our macros are used across finance, insurance, government, construction, logistics, retail and healthcare in New Zealand.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Let&apos;s automate that process.</h2>
            <p className="mb-8 text-white/80">Tell us what your team is doing manually each week and we will show you what is possible.</p>
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
