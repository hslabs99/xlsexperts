import type { Metadata } from 'next'
import { marketServiceSchema } from '@/lib/seo'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { faqPageJsonLd } from '@/lib/page-seo-faqs'
import { Navbar } from '@/components/navbar'
import { PageContact } from '@/components/page-contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { SolutionCrossLinks } from '@/components/solutions/solution-cross-links'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata('/excel-dashboard-development')
}

const problems = [
  'Leadership reporting built from scratch in Excel every month by someone who knows "how it works"',
  'Charts and KPIs that need manual updating before every meeting',
  'Data spread across multiple sheets with no single clear view for decision-makers',
  'Inconsistent formatting that makes reports look different each period',
  'No interactivity — stakeholders cannot filter, slice or drill down without asking IT',
  'Hours spent on presentation formatting rather than analysis',
]

const steps = [
  {
    number: '01',
    title: 'Requirements and data review',
    points: ['Understand the audience and the decisions the dashboard supports', 'Review existing data sources and refresh cadence', 'Agree KPIs, charts and layout before building begins'],
    deliverable: 'Dashboard spec with layout wireframe, data map and refresh approach.',
  },
  {
    number: '02',
    title: 'Build and design',
    points: ['Data model built before the visual layer', 'Charts, slicers and interactivity configured', 'Consistent formatting and professional visual design'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Handover and refresh automation',
    points: ['Refresh process documented and simplified', 'Training on updating data and using interactivity', 'Automation of data import where possible'],
    deliverable: null,
  },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: '/excel-dashboard-development',
    name: 'Excel Dashboard Development',
    description: 'Custom Excel dashboard development for New Zealand businesses. Interactive, automated dashboards for decision-making.',
  })
}


export default async function ExcelDashboardDevelopmentPage() {
  const seo = await getPageSeo('/excel-dashboard-development')
  const serviceSchema = await buildServiceSchema()
  const exampleTiles = await getServicePageTiles('/excel-dashboard-development')
  const faqSchema = faqPageJsonLd(seo.faqs)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Excel Dashboard Development</span>
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

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Dashboard problems we solve</h2>
            <p className="mb-12 text-center text-gray-500">Reporting pain points common across New Zealand businesses.</p>
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
          heading="Dashboard examples"
          subheading="Real dashboards built for New Zealand businesses and leadership teams."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From data to decision-ready dashboard.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Excel dashboard development across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We build Excel dashboards for businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and regional areas. Dashboards are delivered remotely and designed to work with your existing data infrastructure, whether that is SQL, cloud systems, CSV exports or manual data entry. We have built reporting tools for finance, insurance, energy, retail, logistics and government sectors.</p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
            <div className="space-y-6">
              {seo.faqs.map((faq) => (
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
              href: '/solutions/dashboards-business-intelligence',
              label: 'Dashboards & Business Intelligence',
            },
          ]}
        />

        <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready for a dashboard your team will trust?</h2>
            <p className="mb-8 text-white/80">Tell us what decisions you need to make and what data you have — we will design the dashboard around that.</p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <PageContact topicHref="/excel-dashboard-development" />
      </main>
    </>
  )
}
