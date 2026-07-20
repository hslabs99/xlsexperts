import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Spreadsheet Auditing Services New Zealand | XLS Experts',
  description:
    'Professional spreadsheet auditing for New Zealand businesses. We independently review Excel models and spreadsheets for formula errors, structural issues and calculation risks before they cause problems.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/spreadsheet-auditing' },
  openGraph: {
    title: 'Spreadsheet Auditing Services New Zealand | XLS Experts',
    description: 'Independent spreadsheet auditing for NZ businesses. Find formula errors, structural risks and logic issues before they cause problems.',
    url: 'https://www.xlsexperts.co.nz/spreadsheet-auditing',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'A critical spreadsheet is used for major financial decisions but has never been reviewed by anyone outside the team',
  'Formula errors discovered after a report has already been presented to the board or auditors',
  'A model inherited from someone who has left — and no one is sure if the logic is still correct',
  'Circular references or broken links that have been ignored because no one knows how to fix them',
  'Inconsistent formulas across rows where some cells have been manually overridden',
  'A spreadsheet that works most of the time — but occasionally produces numbers that look wrong',
]

const steps = [
  {
    number: '01',
    title: 'Intake and scope',
    points: ['Receive the spreadsheet and understand its purpose', 'Identify the decisions, reports or processes it supports', 'Agree the scope and depth of review required'],
    deliverable: 'Confirmation of audit scope and expected turnaround.',
  },
  {
    number: '02',
    title: 'Structured audit',
    points: ['Formula consistency and error checking', 'Logic review — does the model calculate what it says it does?', 'Structural review — inputs, calculations, outputs, documentation', 'Data integrity and input validation assessment'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Report and recommendations',
    points: ['Written audit report with findings categorised by severity', 'Recommendations for fixes or improvements', 'Optional: we fix identified issues as a separate engagement'],
    deliverable: 'Audit report with findings, risk ratings and recommendations.',
  },
]

const faqs = [
  { q: 'When should a spreadsheet be professionally audited?', a: 'A spreadsheet should be audited when it supports significant financial decisions, is used in regulatory submissions, has been inherited from someone who has left, or has grown in complexity beyond what the original author intended. If numbers from a spreadsheet are used to make material decisions, it is worth getting independent assurance.' },
  { q: 'What does a spreadsheet audit actually involve?', a: 'Our audits review formula consistency (are all rows using the same logic?), calculation integrity (does the model do what it says it does?), structural quality (inputs, calculations and outputs properly separated?), error checking (broken references, circular references, hard-coded overrides) and documentation adequacy.' },
  { q: 'How long does a spreadsheet audit take?', a: 'A straightforward workbook audit typically takes two to four days. A complex multi-sheet model or a formal audit with a written report suitable for external use typically takes five to ten business days.' },
  { q: 'Can you audit a spreadsheet confidentially?', a: 'Yes. All audit engagements are conducted under a non-disclosure agreement. We handle your data securely and return or delete files at the conclusion of the engagement.' },
  { q: 'Do you fix issues found during the audit?', a: 'The audit itself produces a report of findings. We offer a separate remediation engagement to fix identified issues — this can be quoted after the audit is complete and the scope of fixes is clear.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Spreadsheet Auditing',
  description: 'Independent spreadsheet auditing for New Zealand businesses. Find formula errors, structural risks and logic issues.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/spreadsheet-auditing',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Spreadsheet Auditing',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function SpreadsheetAuditingPage() {
  const exampleTiles = await getServicePageTiles('/spreadsheet-auditing')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Spreadsheet Auditing</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Is the spreadsheet you rely on actually correct?
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Spreadsheet errors are more common — and more costly — than most businesses realise. We provide independent spreadsheet audits for New Zealand businesses, reviewing the models and workbooks that support critical decisions before those errors surface at the wrong moment.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Situations that call for a spreadsheet audit</h2>
            <p className="mb-12 text-center text-gray-500">Common spreadsheet risk scenarios across New Zealand organisations.</p>
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
          heading="Spreadsheet audit case studies"
          subheading="Issues found — and prevented — through independent spreadsheet review."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Our audit process</h2>
            <p className="mb-12 text-center text-gray-500">Structured, independent review with a written report.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Spreadsheet auditing across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We provide independent spreadsheet auditing to businesses and organisations throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and beyond. Audit engagements are conducted remotely under NDA. We have audited spreadsheets used in finance, insurance, property, regulatory compliance and executive decision-making across New Zealand.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Get independent assurance on your spreadsheet.</h2>
            <p className="mb-8 text-white/80">Tell us about the spreadsheet you need reviewed and we will confirm the right audit approach.</p>
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
