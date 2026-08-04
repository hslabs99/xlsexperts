import type { Metadata } from 'next'
import { marketServiceSchema } from '@/lib/seo'
import { getPageSeo, pageSeoMetadata } from '@/lib/page-seo-server'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { CheckCircle, AlertTriangle, ArrowRight, XCircle } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return pageSeoMetadata('/vba-to-office-scripts-migration')
}

const problems = [
  {
    heading: 'VBA breaks in Excel for the web and mobile',
    body: 'VBA macros only run in the desktop application. As organisations move to Microsoft 365 and web-based Excel, VBA becomes a blocker — users on non-Windows devices or shared workbooks hit silent failures.',
  },
  {
    heading: 'Macros flagged as security risks',
    body: 'Enterprise IT teams increasingly block or restrict macro-enabled workbooks. Trust Centre policies, Protected View, and Intune device management settings mean VBA-enabled files are quarantined or stripped before they reach end users.',
  },
  {
    heading: 'No integration with modern automation platforms',
    body: 'VBA cannot be triggered by Power Automate, logic apps, or REST APIs. This means automation workflows that touch Excel must work around VBA rather than through it.',
  },
  {
    heading: 'Version control and collaboration conflicts',
    body: 'VBA is embedded in workbook files. When multiple users share a file via SharePoint or OneDrive, VBA code cannot be version-controlled cleanly, and co-authoring is not supported in macro-enabled workbooks.',
  },
  {
    heading: 'Spreadsheet workflows that need Microsoft 365, not just a rewrite',
    body: 'Remote or multi-user access is difficult, approvals live in email, and shared lists sit in uncontrolled workbooks. Migrating automation to Office Scripts is often part of a wider move into SharePoint and Teams-friendly collaboration — not only a language change.',
  },
]

const limitations = [
  {
    heading: 'No access to the local file system',
    body: 'Office Scripts run in a sandboxed cloud environment. They cannot read from or write to local drives, network paths, or UNC paths. Any automation that currently pulls from a mapped drive must be rearchitected to use SharePoint document libraries or OneDrive.',
    severity: 'high',
  },
  {
    heading: 'No external HTTP calls from scripts directly',
    body: 'Unlike VBA with WinHTTP or XMLHTTP, Office Scripts cannot make arbitrary HTTP requests to external APIs. External data calls must be handled by Power Automate flows that pass data into scripts as parameters.',
    severity: 'high',
  },
  {
    heading: 'Single-threaded, time-limited execution',
    body: 'Office Scripts run synchronously with a hard execution limit. Scripts that process large datasets or perform many sequential operations can hit timeout thresholds. Logic that loops over thousands of rows needs to be restructured using batch API patterns.',
    severity: 'medium',
  },
  {
    heading: 'No UI/dialog interaction',
    body: 'VBA can show userforms, MsgBox dialogs, and custom UI elements. Office Scripts have no equivalent — all user interaction must happen through the Excel interface, task panes (Office Add-ins), or Power Automate approval flows.',
    severity: 'medium',
  },
  {
    heading: 'Limited inter-workbook operations',
    body: 'VBA can open, read, and write to other workbooks with full object model access. Office Scripts can only operate on the workbook passed to them by Power Automate — cross-workbook orchestration requires a flow that runs multiple scripts in sequence.',
    severity: 'medium',
  },
  {
    heading: 'TypeScript only — no legacy VBA libraries',
    body: 'Office Scripts are written in TypeScript, not VBA. Any code that relies on third-party VBA libraries, COM references, or Windows API calls must be fully rewritten. The Office Scripts API surface is also more limited than the full Excel VBA object model.',
    severity: 'low',
  },
]

const sharepointNuances = [
  {
    heading: 'Scripts are stored per-user, not per-file',
    body: 'By default, Office Scripts are saved to the author\'s OneDrive, not inside the workbook or the SharePoint site. This means another user cannot run your script unless it has been shared explicitly or deployed via an organisational scripts library through admin policy.',
  },
  {
    heading: 'Shared scripts require specific tenant admin configuration',
    body: 'For scripts to be shared across a team or organisation, IT must enable the "Share scripts across the organisation" setting in the Microsoft 365 Admin Centre. Without this, each user sees only their own scripts — a significant operational gap in a SharePoint team context.',
  },
  {
    heading: 'Power Automate is the deployment mechanism',
    body: 'The practical deployment pattern for Office Scripts in SharePoint is Power Automate. Flows trigger scripts against specific SharePoint-hosted workbooks, handle scheduling, pass in parameters, and manage outputs. This coupling means changes to scripts also require flow maintenance.',
  },
  {
    heading: 'Licensing gates automation at scale',
    body: 'Running Office Scripts via Power Automate requires a Power Automate per-user or per-flow licence in addition to a Microsoft 365 Business Standard or above licence. The "Run script" action is not available on the free Power Automate tier. This is consistently missed in initial planning.',
  },
  {
    heading: 'Co-authoring is supported but concurrency is not',
    body: 'Multiple users can view a workbook simultaneously in SharePoint, but Office Scripts cannot be run on a workbook that another user is actively editing. Automations that run unattended must account for file lock states.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Automation Audit',
    body: 'We review your existing VBA codebase, identify what is a direct port, what needs redesign, and what is better left in VBA or moved to a different technology entirely. Not everything should migrate.',
  },
  {
    number: '02',
    title: 'Architecture Design',
    body: 'We design the target state — which automations become Office Scripts, which become Power Automate flows, which require Power Query or Power Apps. We map SharePoint library structures, licensing requirements, and deployment approach before writing a line of code.',
  },
  {
    number: '03',
    title: 'Migration & Testing',
    body: 'Scripts are written in TypeScript against the Office Scripts API, tested against real SharePoint-hosted workbooks, and validated for edge cases. Power Automate flows are built and documented. We test under actual M365 tenant conditions, not just local.',
  },
  {
    number: '04',
    title: 'Deployment & Handover',
    body: 'We configure organisational script sharing, document the deployment model, and train your team on managing flows and scripts. You receive working automations and the knowledge to maintain them.',
  },
]

const faqs = [
  {
    q: 'Should we migrate all our VBA to Office Scripts?',
    a: 'Not necessarily. VBA remains the right choice for desktop-only automations, complex UI-driven tools, workbooks that do not need to run in the cloud, and scenarios requiring full Excel object model access. We assess each automation individually and recommend migration only where it adds genuine value.',
  },
  {
    q: 'Can Office Scripts replace VBA userforms?',
    a: 'No. Office Scripts have no UI capability. If your VBA relies on userforms or dialogs, the replacement is either an Office Add-in task pane (a web-based interface), a Power Apps canvas app, or a redesigned workflow that eliminates the need for user input at runtime.',
  },
  {
    q: 'Can you work with our existing Microsoft 365 environment?',
    a: 'Yes. We regularly migrate spreadsheet automation into Office Scripts and Power Automate within your existing Microsoft 365 tenancy, SharePoint sites, security policies and licensing — including organisational script sharing where IT enables it.',
  },
  {
    q: 'Can we keep Excel interfaces while moving shared work into SharePoint?',
    a: 'Yes. A common modernisation path is to keep familiar Excel workbooks for analysis while moving shared lists, approvals, documents and scheduled automation into SharePoint and Power Automate with Office Scripts.',
  },
  {
    q: 'Do all Microsoft 365 licences include Office Scripts?',
    a: 'No. Office Scripts are included in Microsoft 365 Business Standard, Business Premium, E3, and E5. They are not available in Microsoft 365 Business Basic or Microsoft 365 Apps for Business. Running scripts via Power Automate also requires a qualifying Power Automate licence.',
  },
  {
    q: 'How does Office Scripts perform with large Excel files?',
    a: 'Performance depends on how the script is written. Reading and writing large ranges in bulk (using getValues/setValues on whole ranges rather than cell-by-cell loops) is significantly faster. Scripts that iterate row-by-row on thousands of records will time out. We design scripts with the batch API pattern from the outset.',
  },
  {
    q: 'Can Office Scripts trigger automatically on a schedule?',
    a: 'Yes, but only via Power Automate. A scheduled flow in Power Automate calls the "Run script" action against a specific workbook in SharePoint or OneDrive. The script itself cannot self-schedule — it always needs a flow trigger.',
  },
  {
    q: 'We use SharePoint on-premises, not SharePoint Online. Does this work?',
    a: 'No. Office Scripts require Microsoft 365 cloud services and Excel for the web. They do not function against SharePoint Server (on-premises). If your organisation has not migrated to SharePoint Online, VBA or alternative automation approaches remain the path forward.',
  },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: '/vba-to-office-scripts-migration',
    name: 'VBA to Office Scripts Migration',
    description: 'Expert migration from Excel VBA to Office Scripts for Microsoft 365 cloud automation. Covers SharePoint deployment, Power Automate integration, licensing requirements, and practical limitations of the Office Scripts platform.',
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

const severityColour: Record<string, string> = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#1a6b3c',
}

const severityLabel: Record<string, string> = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
}

export default async function VBAToOfficeScriptsMigrationPage() {
  const seo = await getPageSeo('/vba-to-office-scripts-migration')
  const serviceSchema = await buildServiceSchema()
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

        {/* Hero */}
        <section
          className="relative overflow-hidden py-24"
          style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}
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
              Cloud Automation
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
              Talk to an automation specialist
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Why migrate — common problems */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              Why organisations are moving away from VBA
            </h2>
            <p className="mb-12 text-center text-gray-500 max-w-2xl mx-auto">
              VBA served organisations well for decades. But Microsoft 365 environments have fundamentally changed the context it operates in.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {problems.map((p) => (
                <div key={p.heading} className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
                  <div className="mb-3 flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" />
                    <h3 className="font-display font-bold text-gray-900">{p.heading}</h3>
                  </div>
                  <p className="pl-8 text-sm leading-relaxed text-gray-600">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Office Scripts cannot do — limitations */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-4 flex items-center justify-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="font-display text-3xl font-bold text-gray-900">
                Real limitations you need to know
              </h2>
            </div>
            <p className="mb-12 text-center text-gray-500 max-w-2xl mx-auto">
              Office Scripts is a capable platform — but it is not VBA with a cloud label. These constraints need to be understood before any migration is planned.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {limitations.map((lim) => (
                <div key={lim.heading} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                      <h3 className="font-display font-bold text-gray-900">{lim.heading}</h3>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: severityColour[lim.severity] }}
                    >
                      {severityLabel[lim.severity]}
                    </span>
                  </div>
                  <p className="pl-8 text-sm leading-relaxed text-gray-600">{lim.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SharePoint nuances */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              SharePoint deployment — what no one tells you
            </h2>
            <p className="mb-12 text-center text-gray-500 max-w-2xl mx-auto">
              Most Office Scripts documentation focuses on individual use. Deploying in a SharePoint team context introduces a different set of constraints.
            </p>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
              {sharepointNuances.map((item, i) => (
                <div key={i} className="px-8 py-7">
                  <h3 className="font-display mb-2 font-bold text-gray-900">{item.heading}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spreadsheet workflow modernisation */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-4 text-center text-3xl font-bold text-gray-900">
              Modernising spreadsheet workflows in Microsoft 365
            </h2>
            <p className="mb-4 text-base leading-relaxed text-gray-600">
              Office Scripts migration is often one step in spreadsheet process
              modernisation — not the whole answer. We rebuild legacy VBA into
              maintainable cloud automation where it adds value, and design
              SharePoint and Teams-friendly patterns so shared work is not stuck
              in email attachments and uncontrolled file copies.
            </p>
            <p className="text-base leading-relaxed text-gray-600">
              Where Excel remains the right analysis layer, we keep it. Where
              approvals, scheduled runs and multi-user access matter, we move
              those parts into Power Automate, SharePoint libraries and Office
              Scripts — configured for your tenancy, licensing and security
              policies.
            </p>
          </div>
        </section>

        {/* When to use what — comparison */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
              VBA vs Office Scripts — when to use which
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200" style={{ backgroundColor: '#1a6b3c' }}>
                    <th className="px-6 py-4 text-left font-semibold text-white">Scenario</th>
                    <th className="px-6 py-4 text-center font-semibold text-white">VBA</th>
                    <th className="px-6 py-4 text-center font-semibold text-white">Office Scripts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ['Runs on Windows desktop only', true, false],
                    ['Runs in Excel for the web / SharePoint', false, true],
                    ['Triggered by Power Automate on a schedule', false, true],
                    ['Complex userforms and custom UI', true, false],
                    ['Full Excel object model access', true, false],
                    ['Co-authoring compatible workbooks', false, true],
                    ['Access to local file system / network drives', true, false],
                    ['No IT macro policy restrictions', false, true],
                    ['Calls external APIs directly', true, false],
                    ['Integrates with Teams and SharePoint natively', false, true],
                  ].map(([scenario, vba, scripts]) => (
                    <tr key={String(scenario)} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700">{scenario}</td>
                      <td className="px-6 py-4 text-center">
                        {vba
                          ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a6b3c]" />
                          : <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {scripts
                          ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a6b3c]" />
                          : <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              How we approach migration
            </h2>
            <p className="mb-12 text-center text-gray-500">Structured, practical, no surprises</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-gray-200 p-7 shadow-sm">
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#1a6b3c' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-display mb-3 font-bold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {faqs.map((faq) => (
                <div key={faq.q} className="px-8 py-7">
                  <h3 className="font-display mb-3 font-bold text-gray-900">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm text-gray-500">
              XLS Experts provides VBA to Office Scripts migration services to organisations across
              New Zealand, including Auckland, Wellington, Christchurch, Hamilton, and Tauranga.
              Most migration work is delivered remotely via Microsoft 365.
            </p>
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">
              Not sure whether to migrate?
            </h2>
            <p className="mb-8 text-white/80">
              We will assess your existing VBA and give you an honest view of what should move to
              Office Scripts, what should stay, and what needs a different approach.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50"
            >
              Book a free discovery call
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
