import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Workflow Automation New Zealand | XLS Experts',
  description:
    'AI-powered workflow automation for New Zealand businesses. We integrate AI tools with Excel, spreadsheets and existing processes to automate data extraction, classification, summarisation and decision support.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/ai-workflow-automation' },
  openGraph: {
    title: 'AI Workflow Automation New Zealand | XLS Experts',
    description: 'AI workflow automation for NZ businesses. Integrate AI with Excel and existing processes to automate data extraction, classification and decision support.',
    url: 'https://www.xlsexperts.co.nz/ai-workflow-automation',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'Staff reading documents, emails or reports and manually extracting structured data into Excel',
  'Categorising or classifying incoming data — invoices, enquiries, feedback — by hand',
  'Generating routine reports or summaries that always follow the same pattern',
  'Reviewing documents for specific information and manually populating a spreadsheet',
  'No way to use AI capabilities without replacing Excel-based workflows the team already relies on',
  'AI tools used ad hoc by individuals but never integrated into an actual business process',
]

const steps = [
  {
    number: '01',
    title: 'Process and data review',
    points: ['Understand the current manual process and what AI would replace or assist', 'Review the data inputs — documents, emails, forms, exports', 'Define the structured output and how it integrates with Excel or other systems'],
    deliverable: 'AI integration design with data flow, model approach and output specification.',
  },
  {
    number: '02',
    title: 'Build and validate',
    points: ['AI model or API integration built and connected to the workflow', 'Excel or downstream system integration built and tested', 'Accuracy validated against real data with human review layer configured'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Deployment and governance',
    points: ['Human-in-the-loop review process for exception handling', 'Staff training on how to use and oversee the AI workflow', 'Monitoring approach for output quality over time'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What kinds of tasks is AI well suited to in a spreadsheet workflow?', a: 'AI is particularly effective for tasks that involve reading unstructured data and producing structured output — extracting information from documents, classifying or categorising data, summarising text, matching records and identifying patterns that would require significant human reading time.' },
  { q: 'Will AI replace the Excel-based processes we already have?', a: 'No — our approach is to integrate AI as an input layer that feeds your existing Excel processes. The Excel workflows, formulas and reporting structures you already rely on remain in place. AI handles the unstructured data preparation that currently requires human reading and transcription.' },
  { q: 'How accurate is AI data extraction?', a: 'Accuracy depends on the document type and the consistency of the source data. For structured documents like invoices and forms, accuracy is typically 90 to 98%. We always design workflows with a human review step for exceptions and implement accuracy monitoring over time.' },
  { q: 'Which AI tools do you use?', a: 'We use OpenAI, Azure AI and other purpose-fit models depending on the task. We also integrate with Microsoft Copilot where it is already available in the client environment. We recommend the right tool based on cost, accuracy and data privacy requirements for each project.' },
  { q: 'How do you handle data privacy when using AI tools?', a: 'Data privacy is a primary consideration in every AI workflow. We use API-based processing rather than consumer AI tools, ensure data does not leave the agreed environment, and can work with Azure-hosted AI models for clients with strict data residency requirements.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Workflow Automation',
  description: 'AI-powered workflow automation for New Zealand businesses. Integrate AI with Excel and existing processes.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/ai-workflow-automation',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'AI Workflow Automation',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default async function AIWorkflowAutomationPage() {
  const exampleTiles = await getServicePageTiles('/ai-workflow-automation')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">AI Workflow Automation</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Put AI to work on the tasks your team should not be doing manually.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              AI can read documents, extract data, classify records and generate summaries far faster than any manual process. We integrate AI into Excel-based workflows for New Zealand businesses — handling the unstructured data preparation that currently consumes your team&apos;s time, so they can focus on the work that actually needs human judgement.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Manual tasks ready for AI</h2>
            <p className="mb-12 text-center text-gray-500">High-value manual processes AI can take over in your business.</p>
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
          heading="AI workflow automation examples"
          subheading="AI integrated into real business workflows for New Zealand organisations."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From manual process to governed AI workflow.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">AI workflow automation across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We build AI-integrated workflows for businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga and beyond. All AI workflow projects are delivered remotely. We work with businesses across finance, legal, HR, insurance, property and operations who are ready to apply AI to real business processes rather than just experimenting with tools.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to put AI to work in your business?</h2>
            <p className="mb-8 text-white/80">Tell us which manual processes consume the most time and we will identify where AI can make the biggest difference.</p>
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
