import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Enterprise Excel VBA Development | XLS Experts New Zealand',
  description:
    'We design and build robust Excel/VBA applications and process automations that reduce manual work, improve accuracy, and hold up in enterprise environments across New Zealand.',
  alternates: {
    canonical: 'https://www.xlsexperts.co.nz/enterprise-excel-vba-development',
  },
  openGraph: {
    title: 'Enterprise Excel VBA Development | XLS Experts New Zealand',
    description:
      'Robust Excel/VBA applications and process automations built to enterprise standards. Pricing tools, forecasting models, project controls, reporting automation, and database-connected solutions.',
    url: 'https://www.xlsexperts.co.nz/enterprise-excel-vba-development',
    images: [{ url: '/images/enterprise-hero.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Excel VBA Development | XLS Experts New Zealand',
    description:
      'Robust Excel/VBA applications and process automations built to enterprise standards.',
    images: ['/images/enterprise-hero.png'],
  },
}

const qualities = [
  { label: 'Stable', detail: 'Clear structure, controlled inputs, fewer breakpoints' },
  { label: 'Fast', detail: 'Array-based processing, efficient design patterns' },
  { label: 'Maintainable', detail: 'Clean code, documentation, handover' },
  { label: 'Extensible', detail: 'Modular code designed for future enhancements' },
  { label: 'Functional', detail: 'Validation, error handling, logging, exception handling' },
]

const useCases = [
  'Pricing / quoting tools used across multiple teams with controlled inputs',
  'Forecasting and financial models with scenarios and audit-friendly structure',
  'Project controls: schedule, cost tracking, resource allocation, progress reporting, governance',
  'Reporting automations: data aggregation, processing and analysis automation',
  'Data pipelines inside Excel: cleaning, mapping, consolidating exports from systems (SQL, API)',
  'Enterprise apps: VBA, Cloud Hybrid (VBA + SQL) or fully cloud-based with .NET or Java + Cloud DB',
]

const steps = [
  {
    number: '01',
    title: 'Discovery & Scope',
    subtitle: 'Short and practical',
    points: [
      'Users, workflow, decisions the tool supports',
      'Data sources and volumes',
      'Risks: accuracy, speed, version control, ownership',
      'Success criteria — what "done" looks like',
    ],
    deliverable: 'Architecture review, build plan + scope (clear features, timeline-style milestones, assumptions).',
  },
  {
    number: '02',
    title: 'Build — logical, frequent Agile releases',
    subtitle: 'Strong focus on UX and UI requirements throughout',
    points: [
      'Provide a working tool early and iterate together',
      'Prototype → MVP → hardened enterprise version → Live',
    ],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Handover & Support',
    subtitle: 'We deliver a solution your team can own',
    points: [
      'Clean, readable VBA code',
      'Documentation (user + technical)',
      'Optional training for power users',
      'Support path for enhancements',
    ],
    deliverable: null,
  },
]

const caseStudies = [
  {
    tag: 'VBA · EDI · SQL',
    title: 'Financial Reporting Automation',
    client: 'AMP Financial Services',
    body: 'AMP Financial Services required extensibility and maintenance of an existing Fund Manager solution. In-depth discovery was followed by enhancements to the reporting tools and workflow automation. This project demonstrates Excel\'s ability to automate reporting within a multi-connected landscape with various EDI technologies.',
  },
  {
    tag: 'Excel · VBA · EDI',
    title: 'Maintenance Scheduling and Optimisation Tool',
    client: 'SIMPRO Integration',
    body: 'Excel was used as an add-on tool for SIMPRO so that sales and data analysis staff can schedule and optimise asset maintenance schedules and pricing. Interacting with SIMPRO via simple CSV EDI, the tool provides a rapid development environment that delivers extended functionality outside the core software platform.',
  },
  {
    tag: 'SQL · VBA · Financials',
    title: 'Claim Analysis Reporting Tool',
    client: 'NZI Insurance',
    body: 'NZI required an enterprise app for collecting and analysing claims data. Collecting claims analysis data via a web app (.NET + MS SQL), we created a set of management dashboards highlighting common data trends and outliers. The data could then be further analysed by staff in Excel, leveraging familiar interfaces and existing skill sets.',
  },
  {
    tag: 'VBA · Pivots · SharePoint',
    title: 'Enterprise Applications',
    client: 'Contact Energy',
    body: 'Like many enterprises, Contact Energy relies on agile development tools to automate and facilitate functionality outside of their main software platforms. We developed applications for Resource Planning and Knowledge Sharing, leveraging SharePoint as a hosting platform for easy deployment and integration with organisational security protocols.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Enterprise Excel VBA Development',
  description:
    'Design and development of robust Excel/VBA applications and process automations for enterprise organisations in New Zealand. Includes pricing tools, forecasting models, reporting automation, project controls, and database-connected solutions.',
  provider: {
    '@type': 'ProfessionalService',
    name: 'XLS Experts',
    url: 'https://www.xlsexperts.co.nz',
    areaServed: { '@type': 'Country', name: 'New Zealand' },
  },
  url: 'https://www.xlsexperts.co.nz/enterprise-excel-vba-development',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Excel VBA Development',
}

export default function EnterpriseExcelVBAPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />

      <main className="pt-16">

        {/* Hero */}
        <section
          className="relative overflow-hidden py-24"
          style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}
        >
          {/* subtle grid overlay */}
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
              Enterprise Grade Solutions
            </span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Turn spreadsheets into governed Excel applications your teams can rely on.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              When Excel becomes business-critical — pricing, forecasting, reporting packs, project
              controls — &ldquo;a workbook&rdquo; isn&apos;t enough. We design and build robust Excel/VBA
              applications and process automations that reduce manual work, improve accuracy, and hold
              up in enterprise environments.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
            >
              Book a free consultation call
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* What we build */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

              {/* Qualities */}
              <div>
                <h2 className="font-display mb-6 text-2xl font-bold text-gray-900">
                  We build Excel/VBA solutions that are:
                </h2>
                <ul className="space-y-4">
                  {qualities.map((q) => (
                    <li key={q.label} className="flex gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" />
                      <div>
                        <span className="font-semibold text-gray-900">{q.label} — </span>
                        <span className="text-gray-600">{q.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Use cases */}
              <div>
                <h2 className="font-display mb-6 text-2xl font-bold text-gray-900">
                  Typical NZ Enterprise use cases:
                </h2>
                <ul className="space-y-3">
                  {useCases.map((uc) => (
                    <li key={uc} className="flex gap-3 text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How we work */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              How we work
            </h2>
            <p className="mb-12 text-center text-gray-500">Predictable, high-quality delivery</p>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
                >
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#1a6b3c' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-display mb-1 text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mb-4 text-sm text-gray-500">{step.subtitle}</p>
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

        {/* Case studies */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-2 text-center text-3xl font-bold text-gray-900 uppercase tracking-wide">
              NZ Enterprise Case Studies
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {caseStudies.map((cs) => (
                <div
                  key={cs.title}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-7 shadow-sm"
                >
                  <span className="mb-3 inline-block rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">
                    {cs.tag}
                  </span>
                  <h3 className="font-display mb-1 text-lg font-bold text-gray-900">{cs.title}</h3>
                  <p className="mb-3 text-sm font-medium text-gray-500">{cs.client}</p>
                  <p className="text-sm leading-relaxed text-gray-600">{cs.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-16 text-center"
          style={{ backgroundColor: '#1a6b3c' }}
        >
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">
              Ready to build something enterprise-grade?
            </h2>
            <p className="mb-8 text-white/80">
              Talk to us about your requirements and we&apos;ll scope a solution that fits.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50"
            >
              Book a free consultation call
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
