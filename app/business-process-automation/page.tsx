import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Business Process Automation New Zealand | XLS Experts',
  description:
    'Business process automation for New Zealand businesses using Excel, VBA, Power Automate and AI tools. We identify your highest-value manual processes and automate them with the right technology.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/business-process-automation' },
  openGraph: {
    title: 'Business Process Automation New Zealand | XLS Experts',
    description: 'Business process automation for NZ businesses. Excel, VBA, Power Automate and AI — we automate your highest-value manual processes.',
    url: 'https://www.xlsexperts.co.nz/business-process-automation',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'The same data being manually re-entered across multiple systems every week',
  'Approval processes that depend on email chains and manual follow-up',
  'Report generation that requires a day of preparation before analysis can begin',
  'Document creation done by hand from template files — one at a time',
  'No visibility of where processes break down or how long they actually take',
  'Staff time consumed by routine, low-value work that should not require human attention',
]

const steps = [
  {
    number: '01',
    title: 'Process mapping',
    points: ['Walk through the current process step by step', 'Identify manual steps, decision points and exceptions', 'Calculate the time cost and error risk of the current approach'],
    deliverable: 'Process map with automation opportunity analysis and recommended approach.',
  },
  {
    number: '02',
    title: 'Solution design and build',
    points: ['Choose the right tools — Excel/VBA, Power Automate, AI or a combination', 'Build the automation with exception handling and logging', 'Test thoroughly with real process data and edge cases'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Deployment and handover',
    points: ['Controlled rollout with parallel running if required', 'User training and process documentation', 'Support path for monitoring and enhancements'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What tools do you use for business process automation?', a: 'We primarily use Excel VBA, Power Automate, Power Query and increasingly AI-assisted tools depending on what the process requires. We choose the right tool for each job rather than applying a single technology to every problem.' },
  { q: 'How do you know which processes are worth automating?', a: 'We use a simple framework: frequency multiplied by time cost multiplied by error risk. High-frequency, time-consuming processes with significant error consequences are the best automation candidates. We walk through your operations in discovery and identify the highest-value opportunities.' },
  { q: 'Do we need to change our existing systems to automate a process?', a: 'Usually not. Most of our automation work sits alongside existing systems rather than replacing them — connecting them, processing their outputs and feeding results back in. We work with whatever systems you already have.' },
  { q: 'Is business process automation only for large businesses?', a: 'No. Some of the highest-return automation projects we have delivered have been for SMEs with five to fifty staff. A small team spending fifteen hours a week on a process that could be automated in two weeks of development is a very strong business case.' },
  { q: 'How do you handle exceptions and errors in automated processes?', a: 'Exception handling is built into every automation we deliver. The system logs what it processes, flags exceptions for human review and never silently fails. We design automations so that when something unexpected happens, the right person is notified immediately.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Business Process Automation',
  description: 'Business process automation for New Zealand businesses using Excel, VBA, Power Automate and AI tools.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/business-process-automation',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Business Process Automation',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function BusinessProcessAutomationPage() {
  const exampleTiles = await getServicePageTiles('/business-process-automation')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Business Process Automation</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Automate the work that is keeping your staff from greatness!
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Every New Zealand business has processes that consume staff time, create errors and depend entirely on someone remembering to do them. We identify those processes and automate them using the right combination of Excel, VBA, Power Automate and AI — so your team focuses on work that actually needs human judgement.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Processes that are ready for automation</h2>
            <p className="mb-12 text-center text-gray-500">Manual work patterns we identify and eliminate for NZ businesses.</p>
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
          heading="Business process automation examples"
          subheading="Automation projects delivered for New Zealand organisations."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From process mapping to live automation.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Business process automation across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We deliver business process automation to organisations throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and regional areas. Our work spans SMEs and enterprise across finance, insurance, healthcare, construction, logistics, retail and professional services. Most automation is delivered remotely.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Which processes are costing your team the most?</h2>
            <p className="mb-8 text-white/80">Tell us what your team does manually each week — we will identify the best automation opportunities.</p>
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
