import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Excel Financial Modelling Services New Zealand | XLS Experts',
  description:
    'Professional Excel financial modelling for New Zealand businesses. Three-statement models, budgets, forecasts, valuations and scenario analysis built to best practice standards.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/excel-financial-modelling' },
  openGraph: {
    title: 'Excel Financial Modelling Services New Zealand | XLS Experts',
    description: 'Professional Excel financial modelling for NZ businesses. Three-statement models, forecasts, valuations and scenario analysis to best practice standards.',
    url: 'https://www.xlsexperts.co.nz/excel-financial-modelling',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'Financial models built under pressure with hard-coded assumptions buried in formulas',
  'No scenario analysis — changing one assumption requires manual updates across dozens of cells',
  'Models that work on one person\'s computer but break on anyone else\'s',
  'Boards and lenders asking questions the model cannot answer without rebuilding it',
  'Forecasts that cannot be reconciled back to actuals without significant manual work',
  'Three-statement models where the balance sheet does not balance',
]

const examples = [
  { tag: 'Fundraising', title: 'Series A Investment Model', detail: 'Three-statement model with revenue build-up, headcount plan, cash runway and investor return scenarios — used to successfully raise growth capital.' },
  { tag: 'Acquisition', title: 'Business Acquisition Model', detail: 'Standalone target model, synergy analysis, deal structure scenarios and accretion/dilution analysis for a NZ trade buyer.' },
  { tag: 'Property', title: 'Development Feasibility Model', detail: 'Full development feasibility including land, construction, finance costs and sales revenue with sensitivity analysis on key assumptions.' },
  { tag: 'Operations', title: 'Five-Year Business Plan', detail: 'Integrated P&L, balance sheet and cash flow forecast with department-level cost build, headcount plan and three scenarios for board approval.' },
]

const steps = [
  {
    number: '01',
    title: 'Scope and structure',
    points: ['Understand the purpose — decision-making, fundraising, board reporting', 'Agree structure: revenue drivers, cost model, financing assumptions', 'Define outputs: outputs required and audience'],
    deliverable: 'Model blueprint with structure, assumptions register and timeline.',
  },
  {
    number: '02',
    title: 'Build to best practice',
    points: ['Inputs separated from calculations and outputs', 'Consistent formatting and formula structure throughout', 'Scenario and sensitivity analysis built in from the start'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Review and handover',
    points: ['Walk-through of model logic and assumptions', 'Documentation of key drivers and how to update them', 'Support for presentations or investor queries'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What does a best practice financial model look like?', a: 'A best practice financial model has clearly separated inputs, calculations and outputs. Assumptions are in one place and clearly labelled. Formulas are consistent across rows. There are no hard-coded numbers in calculation cells. The model can be understood and updated by someone who did not build it.' },
  { q: 'Can you build a three-statement model for our business?', a: 'Yes. Three-statement models — linked P&L, balance sheet and cash flow — are a core part of our financial modelling work. We build them to professional standards suitable for board reporting, lender due diligence and investor review.' },
  { q: 'How long does a financial model take to build?', a: 'A straightforward budget or forecast model typically takes one to two weeks. A full three-statement model with scenario analysis and investment-ready formatting is typically two to four weeks depending on complexity.' },
  { q: 'Can you review and fix a financial model we already have?', a: 'Yes. Model reviews and audits are a common engagement. We assess the model for structural issues, formula errors, circular references and missing logic, and either fix what is there or recommend a rebuild.' },
  { q: 'Do you build models for fundraising and due diligence?', a: 'Yes. We have built models used in fundraising rounds, acquisitions, due diligence processes and banking relationships. We understand what investors and lenders look for and build models that hold up to scrutiny.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Excel Financial Modelling',
  description: 'Professional Excel financial modelling for New Zealand businesses. Three-statement models, forecasts, valuations and scenario analysis.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/excel-financial-modelling',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Excel Financial Modelling',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default function ExcelFinancialModellingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Excel Financial Modelling</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Financial models that hold up when it matters most.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Whether you are raising capital, planning for growth or presenting to a board, the quality of your financial model matters. We build Excel financial models for New Zealand businesses to professional standards — structured, auditable and built to answer the hard questions.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Financial modelling problems we solve</h2>
            <p className="mb-12 text-center text-gray-500">Common issues with financial models across New Zealand businesses.</p>
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
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Financial modelling projects we have delivered</h2>
            <p className="mb-12 text-center text-gray-500">A selection of models built for New Zealand businesses and investors.</p>
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
            <p className="mb-12 text-center text-gray-500">Structured, transparent financial model delivery.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Financial modelling services across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We provide financial modelling services to businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton and beyond. Whether you are a founder preparing for a raise, a CFO building the annual budget or an M&A team working through an acquisition, we build models that are fit for purpose and hold up to scrutiny. Most engagements are delivered remotely.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Need a financial model you can stand behind?</h2>
            <p className="mb-8 text-white/80">Tell us what the model needs to support and we will scope the right solution.</p>
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
