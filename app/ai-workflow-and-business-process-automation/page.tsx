import type { Metadata } from 'next'
import { marketPageMetadata, marketServiceSchema } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { SolutionCrossLinks } from '@/components/solutions/solution-cross-links'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

const PAGE_HREF = '/ai-workflow-and-business-process-automation'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: PAGE_HREF,
    title: 'AI Workflow and Business Process Automation NZ | XLS Experts',
    description:
      'Business process automation and spreadsheet process modernisation for New Zealand businesses. Automate manual work with Excel, VBA, Power Automate and AI — or improve fragile spreadsheet workflows before they break.',
    ogTitle: 'AI Workflow and Business Process Automation NZ | XLS Experts',
    ogDescription:
      'Business process automation and spreadsheet modernisation for NZ businesses. Excel, VBA, Power Automate and AI — automate or improve your highest-value manual processes.',
  })
}

const problems = [
  'Staff reading documents, emails or reports and manually extracting structured data into Excel',
  'The same data being manually re-entered across multiple systems every week',
  'Only one person understands a critical spreadsheet process',
  'Multiple uncontrolled versions circulating by email and shared drives',
  'Categorising or classifying incoming data — invoices, enquiries, feedback — by hand',
  'Approval processes that depend on email chains and manual follow-up',
  'Spreadsheets being used as a database — or a process that has clearly outgrown Excel',
  'Files that are too large, slow or unstable, with formulas and macros that break regularly',
  'Report generation that requires a day of preparation before analysis can begin',
  'AI tools used ad hoc by individuals but never integrated into an actual business process',
  'Document creation done by hand from template files — one at a time',
  'Staff time consumed by routine, low-value work that should not require human attention',
]

const modernisationPathways = [
  {
    title: 'Improve the spreadsheet',
    body: 'Clearer structure, validation, documentation and ownership so a critical workbook can be supported by more than one person — without a full rebuild.',
  },
  {
    title: 'Automate the process',
    body: 'Replace copy-paste routines with VBA, Power Automate or AI-assisted steps so reports, exports and hand-offs run consistently.',
  },
  {
    title: 'Move into Microsoft 365',
    body: 'Keep familiar Excel interfaces where useful while shifting shared lists, approvals and documents into SharePoint and Teams-friendly workflows.',
  },
  {
    title: 'Graduate to a cloud application',
    body: 'When multi-user access, permissions and scale matter, move the process onto a database-backed application — often still with Excel as the analysis layer.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Process and opportunity mapping',
    points: [
      'Walk through the current process step by step',
      'Identify manual steps, decision points and where AI can assist',
      'Assess whether the spreadsheet needs improvement, automation or replacement',
      'Calculate the time cost and error risk of the current approach',
    ],
    deliverable:
      'Process map with automation opportunity analysis and recommended tool approach.',
  },
  {
    number: '02',
    title: 'Design, build and validate',
    points: [
      'Choose the right tools — Excel/VBA, Power Automate, AI, Microsoft 365 or a hybrid',
      'Build the automation with exception handling, logging and system integrations',
      'Validate accuracy against real data with a human review layer where needed',
    ],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Deployment and governance',
    points: [
      'Controlled rollout with parallel running if required',
      'Staff training, process documentation and exception handling',
      'Monitoring approach for output quality and ongoing improvements',
    ],
    deliverable: null,
  },
]

const faqs = [
  {
    q: 'What tools do you use for AI workflow and business process automation?',
    a: 'We use Excel VBA, Power Automate, Power Query and AI platforms such as OpenAI and Azure AI depending on what the process requires. We choose the right tool for each job rather than applying a single technology to every problem.',
  },
  {
    q: 'Do you always replace the existing spreadsheet?',
    a: 'No. Spreadsheet and process modernisation often succeeds by improving the workbook, adding validation and automation, or connecting it to better data sources. Replacement is recommended when Excel is being asked to do something it cannot do reliably — such as multi-user transactional work or acting as a system of record.',
  },
  {
    q: 'Can a system begin in Excel and move to the cloud later?',
    a: 'Yes. We often design an intermediate solution that solves the immediate problem in Excel or Microsoft 365, then plan a later migration once requirements and usage patterns are clearer.',
  },
  {
    q: 'How do you know which processes are worth automating?',
    a: 'We use a simple framework: frequency multiplied by time cost multiplied by error risk. High-frequency, time-consuming processes with significant error consequences — including document reading and data classification — are the best candidates. We walk through your operations in discovery and identify the highest-value opportunities.',
  },
  {
    q: 'How do you decide which technology to use?',
    a: 'We start with the business process, then weigh user count, collaboration needs, data volume, integration requirements, IT constraints and total cost of ownership — not a preferred technology stack. Excel remains appropriate when used properly; we do not assume every spreadsheet should be replaced.',
  },
  {
    q: 'Will AI replace the Excel-based processes we already have?',
    a: 'No — our approach is to integrate AI as an input or decision layer that feeds your existing Excel and business processes. The workflows, formulas and reporting structures you already rely on remain in place. AI handles unstructured data preparation and classification that currently requires human reading and transcription.',
  },
  {
    q: 'Do we need to change our existing systems to automate a process?',
    a: 'Usually not. Most of our automation work sits alongside existing systems rather than replacing them — connecting them, processing their outputs and feeding results back in. We work with whatever systems you already have.',
  },
  {
    q: 'How do you handle exceptions, accuracy and data privacy?',
    a: 'Exception handling and human review are built into every automation we deliver. For AI extraction, accuracy is monitored over time and exceptions are flagged for review. We use API-based processing rather than consumer AI tools, and can work with Azure-hosted models for clients with strict data residency requirements.',
  },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: PAGE_HREF,
    name: 'AI Workflow and Business Process Automation',
    description:
      'AI workflow and business process automation for New Zealand businesses using Excel, VBA, Power Automate and AI tools.',
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

export default async function AIWorkflowAndBusinessProcessAutomationPage() {
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
              AI Workflow and Business Process Automation
            </span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Automate the work that is keeping your staff from greatness.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Every New Zealand business has processes that consume staff time,
              create errors and depend on someone remembering to do them — often
              inside fragile spreadsheets that have outgrown their original
              purpose. We identify those processes and improve or automate them
              with the right mix of Excel, VBA, Power Automate and AI — so your
              team focuses on work that actually needs human judgement.
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
              Processes ready for automation — and spreadsheet warning signs
            </h2>
            <p className="mb-12 text-center text-gray-500">
              Manual work patterns and fragile spreadsheet processes we identify
              and modernise — including tasks where AI adds the most value.
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
          heading="Automation examples"
          subheading="AI workflow and business process automation projects for New Zealand organisations."
          tiles={exampleTiles}
        />

        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              Spreadsheet and process modernisation — the right level of change
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
              Excel remains highly effective when used appropriately. Many
              processes only need clearer structure and automation. Others need
              Microsoft 365 workflows, a database or a full application. We
              determine the pathway — not a one-size rebuild.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {modernisationPathways.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
                >
                  <h3 className="font-display mb-3 text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              How we work
            </h2>
            <p className="mb-12 text-center text-gray-500">
              From process mapping to governed, live automation.
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
              Automation across New Zealand
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We deliver AI workflow and business process automation throughout
              New Zealand — Auckland, Wellington, Christchurch, Hamilton,
              Tauranga and regional areas. Our work spans SMEs and enterprise
              across finance, insurance, healthcare, construction, logistics,
              retail and professional services. Most projects are delivered
              remotely.
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
              href: '/solutions/workflow-automation-systems-integration',
              label: 'Workflow Automation & Systems Integration',
            },
            {
              href: '/vba-to-office-scripts-migration',
              label: 'VBA to Office Scripts Migration',
            },
          ]}
        />

        <section
          className="py-16 text-center"
          style={{ backgroundColor: '#1a6b3c' }}
        >
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">
              Which processes are costing your team the most?
            </h2>
            <p className="mb-8 text-white/80">
              Tell us what your team does manually each week — we will identify
              where automation and AI can make the biggest difference.
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
