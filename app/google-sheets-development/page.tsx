import type { Metadata } from 'next'
import { marketPageMetadata, marketServiceSchema } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/google-sheets-development',
    title: 'Google Sheets Development New Zealand | XLS Experts',
    description: 'Custom Google Sheets development for New Zealand businesses. Apps Script automation, connected dashboards, form integrations and collaborative tools built by Google Sheets specialists.',
    ogTitle: 'Google Sheets Development New Zealand | XLS Experts',
    ogDescription: 'Custom Google Sheets development for NZ businesses. Apps Script automation, connected dashboards and collaborative tools.',
  })
}

const problems = [
  'Google Sheets used as a shared database with no structure — causing conflicts and lost data',
  'No automation — everything updated manually across multiple sheets and tabs',
  'Forms collecting data that flows into a Sheet with no processing or alerting',
  'Teams on Google Workspace who need Excel-quality solutions without switching platforms',
  'Sheets connected to nothing — disconnected from the other tools the business runs on',
  'No access controls — anyone can edit anything at any time',
]

const steps = [
  {
    number: '01',
    title: 'Workflow and requirements',
    points: ['Understand the process and collaboration requirements', 'Map data flows, integrations and access needs', 'Decide what to build in Sheets versus Apps Script'],
    deliverable: 'Solution design with structure, automation scope and sharing model.',
  },
  {
    number: '02',
    title: 'Build and connect',
    points: ['Sheets structure built for reliability and clarity', 'Apps Script automation written and tested', 'Integrations with Forms, Gmail, Calendar and external APIs where needed'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Handover and training',
    points: ['User guide for the team', 'Access and sharing permissions configured', 'Support available for ongoing changes'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What can Google Apps Script automate in Sheets?', a: 'Apps Script can automate almost any task in Google Sheets — sending emails, creating calendar events, updating other Sheets, calling external APIs, processing form submissions, generating PDFs and pushing data to other Google Workspace apps.' },
  { q: 'Is Google Sheets suitable for business-critical data?', a: 'Google Sheets is suitable for many business processes, particularly those that require real-time collaboration and access from any device. For high-volume data, complex calculations or data that needs strict version control, we will advise on whether Sheets is the right tool or whether a different approach is more appropriate.' },
  { q: 'Can you connect Google Sheets to external systems?', a: 'Yes. Apps Script can call external APIs, and Sheets supports connections to Google BigQuery, databases via Looker Studio and a range of third-party integrations. We advise on the best connection approach for your specific data source.' },
  { q: 'Can you migrate our Excel spreadsheets to Google Sheets?', a: 'Yes. We handle Excel to Google Sheets migrations, including rewriting VBA macros as Apps Script, adapting formulas that behave differently and restructuring data models to take advantage of real-time collaboration.' },
  { q: 'Do you work with Google Workspace businesses outside Auckland?', a: 'Yes. Google Sheets development is fully remote by nature. We work with Google Workspace businesses throughout New Zealand and can deliver solutions to any region.' },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: '/google-sheets-development',
    name: 'Google Sheets Development',
    description: 'Custom Google Sheets development for New Zealand businesses. Apps Script automation, connected dashboards and collaborative tools.',
  })
}


const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function GoogleSheetsDevelopmentPage() {
  const serviceSchema = await buildServiceSchema()
  const exampleTiles = await getServicePageTiles('/google-sheets-development')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Google Sheets Development</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Google Sheets built to do more than store data.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Google Sheets is more powerful than most businesses realise. With the right structure and Apps Script automation, it can replace expensive SaaS tools, automate workflows and connect your team&apos;s data in real time. We build custom Google Sheets solutions for New Zealand businesses on Google Workspace.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Google Sheets problems we solve</h2>
            <p className="mb-12 text-center text-gray-500">Common issues with Google Sheets across New Zealand teams.</p>
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
          heading="Google Sheets projects we have built"
          subheading="Custom solutions for New Zealand businesses on Google Workspace."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From requirements to a solution your team can use immediately.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Google Sheets developers across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We build custom Google Sheets solutions for businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and regional centres. Because Google Sheets is cloud-based, all our work is delivered remotely. We work with organisations on Google Workspace across education, not-for-profit, professional services, retail and technology sectors.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to get more from Google Sheets?</h2>
            <p className="mb-8 text-white/80">Tell us what your team needs and we will show you what is possible on your platform.</p>
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
