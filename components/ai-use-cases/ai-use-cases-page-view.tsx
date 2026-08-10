import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Breadcrumbs } from '@/components/solutions/breadcrumbs'
import { Contact } from '@/components/contact'
import {
  useCaseNav,
  useCasesRelatedLinks,
} from '@/lib/ai-use-cases-page'

function SectionShell({
  id,
  alt,
  children,
  narrow,
}: {
  id?: string
  alt?: boolean
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <section
      id={id}
      className={alt ? 'bg-gray-50 py-16 sm:py-20' : 'bg-white py-16 sm:py-20'}
    >
      <div className={`mx-auto px-6 ${narrow ? 'max-w-3xl' : 'max-w-5xl'}`}>
        {children}
      </div>
    </section>
  )
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display mb-4 text-3xl font-bold text-gray-900">
      {children}
    </h2>
  )
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display mb-3 mt-10 text-xl font-bold text-gray-900">
      {children}
    </h3>
  )
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-base leading-relaxed text-gray-600">{children}</p>
  )
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-6 rounded-xl border-l-4 border-[#1a6b3c] bg-[#e8f5ee] px-5 py-4 text-sm leading-relaxed text-gray-800 italic">
      {children}
    </blockquote>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mb-6 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
          <CheckCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#1a6b3c]"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-gray-900 p-4 text-xs leading-relaxed text-gray-100 sm:text-sm">
      <code>{children}</code>
    </pre>
  )
}

function DataTable({
  headers,
  rows,
  alignRight,
}: {
  headers: string[]
  rows: string[][]
  alignRight?: number[]
}) {
  const right = new Set(alignRight ?? [])
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-3 font-semibold text-gray-900 ${
                  right.has(i) ? 'text-right' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => (
                <td
                  key={`${row[0]}-${i}`}
                  className={`px-4 py-3 text-gray-600 ${
                    right.has(i) ? 'text-right tabular-nums' : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StepList({
  steps,
}: {
  steps: { title: string; body: ReactNode }[]
}) {
  return (
    <ol className="mb-6 space-y-6">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#1a6b3c' }}
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-display mb-2 text-base font-bold text-gray-900">
              {step.title}
            </h4>
            <div className="text-sm leading-relaxed text-gray-600">
              {step.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function UseCaseHeader({
  number,
  title,
  subtitle,
}: {
  number: string
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-8">
      <span
        className="mb-3 inline-block text-xs font-bold uppercase tracking-widest"
        style={{ color: '#1a6b3c' }}
      >
        Use Case {number}
      </span>
      <H2>{title}</H2>
      <p className="text-lg font-medium leading-snug text-gray-800">{subtitle}</p>
    </div>
  )
}

function ArchitectureBanner() {
  return (
    <div className="my-8 rounded-2xl border border-[#1a6b3c]/25 bg-[#e8f5ee] px-6 py-5 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
        Typical architecture
      </p>
      <p className="mt-2 font-display text-sm font-semibold leading-relaxed text-gray-900 sm:text-base">
        Excel / VBA / Power Query → Secure Cloud API → A.I. Model → Structured
        JSON Response → Excel
      </p>
    </div>
  )
}

export function AiUseCasesPageView() {
  return (
    <main className="pt-16">
      <section
        className="relative overflow-hidden py-20 sm:py-24"
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
        <div className="relative mx-auto max-w-5xl px-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              {
                label: 'A.I. Workflow',
                href: '/ai-workflow-and-business-process-automation',
              },
              { label: 'Use Cases' },
            ]}
          />
          <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            A.I. Use Cases
          </span>
          <h1 className="font-display mb-5 max-w-4xl text-3xl font-bold leading-tight text-white text-balance md:text-4xl lg:text-[2.75rem]">
            A.I. Use Cases for Excel, VBA and Power Query Workflows
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            A.I. does not need to replace an existing Excel solution to add
            significant value. These five patterns show where language,
            interpretation, classification and judgement belong — while Excel
            keeps doing the calculations and reporting.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
            >
              Discuss an A.I. use case <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#use-case-list"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse the five use cases
            </a>
          </div>
        </div>
      </section>

      <SectionShell narrow>
        <P>
          In many cases, the best architecture is to leave Excel, VBA and Power
          Query doing what they already do well — calculations, structured data
          processing, workflow control and reporting — while adding A.I. at
          specific points where conventional programming struggles with language,
          interpretation, classification or judgement.
        </P>
        <P>
          The A.I. capability can sit behind a secure API rather than being
          embedded directly into the workbook.
        </P>
        <ArchitectureBanner />
        <P>
          For XLS Experts solutions, that API could sit within the Google Cloud
          ecosystem and manage authentication, prompt construction, data
          validation, calls to OpenAI or another approved model, logging and
          response handling.
        </P>
        <P>
          The following five use cases demonstrate different ways that
          architecture can be applied.
        </P>
      </SectionShell>

      <SectionShell id="use-case-list" alt>
        <H2>Five practical A.I. use cases</H2>
        <p className="mb-8 text-base text-gray-600">
          Jump to a pattern, or scroll through the full technical walkthroughs.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCaseNav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#1a6b3c]/40 hover:bg-[#e8f5ee]/40"
            >
              <span
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#1a6b3c' }}
              >
                {item.number}
              </span>
              <p className="font-display text-base font-bold text-gray-900 group-hover:underline">
                {item.shortTitle}
              </p>
            </a>
          ))}
          <a
            href="#common-architecture"
            className="group rounded-2xl border border-dashed border-[#1a6b3c]/40 bg-[#e8f5ee]/50 p-6 transition-colors hover:bg-[#e8f5ee]"
          >
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
              Shared pattern
            </span>
            <p className="font-display text-base font-bold text-gray-900 group-hover:underline">
              Common architecture across all five
            </p>
          </a>
        </div>
      </SectionShell>

      {/* Use Case 1 */}
      <SectionShell id="commentary">
        <UseCaseHeader
          number="1"
          title="A.I. Commentary and Interpretation of Excel Data"
          subtitle="Turn rows of operational data into meaningful written analysis"
        />
        <P>
          Many Excel reports contain plenty of numbers but still require somebody
          to interpret what those numbers mean.
        </P>
        <P>
          A finance team may produce a monthly variance report containing
          hundreds of accounts. A sales manager may receive a table showing
          revenue, margin and year-on-year movements by customer. An operations
          team may have service performance data by branch, product or employee.
        </P>
        <P>Excel can identify that a number has changed.</P>
        <P>
          A.I. can help explain{' '}
          <strong className="font-semibold text-gray-800">
            what deserves attention and how to describe it in plain English
          </strong>
          .
        </P>

        <H3>Example</H3>
        <P>Consider a management reporting workbook containing:</P>
        <DataTable
          headers={[
            'Business Unit',
            'Actual',
            'Budget',
            'Prior Year',
            'Margin',
            'Volume',
          ]}
          alignRight={[1, 2, 3, 4, 5]}
          rows={[
            [
              'Auckland',
              '$842,000',
              '$790,000',
              '$765,000',
              '31%',
              '4,220',
            ],
            [
              'Wellington',
              '$516,000',
              '$560,000',
              '$541,000',
              '24%',
              '2,730',
            ],
            [
              'Christchurch',
              '$624,000',
              '$610,000',
              '$590,000',
              '29%',
              '3,105',
            ],
          ]}
        />
        <P>Traditional Excel formulas can calculate:</P>
        <BulletList
          items={[
            'Actual versus budget',
            'Percentage variance',
            'Prior-year movement',
            'Gross margin',
            'Volume movement',
            'Threshold breaches',
          ]}
        />
        <P>A.I. could then generate commentary such as:</P>
        <Quote>
          Auckland materially exceeded both budget and prior year, with revenue
          6.6% above budget and stronger volume. Margin remains healthy at 31%,
          suggesting growth has not been achieved through excessive discounting.
        </Quote>
        <P>For Wellington:</P>
        <Quote>
          Wellington is 7.9% below budget and 4.6% below the prior year. The
          combination of weaker revenue and a 24% margin warrants investigation,
          particularly if the decline is concentrated in specific customers or
          product groups.
        </Quote>
        <P>
          Instead of management manually writing commentary for 30 branches every
          month, A.I. creates a first draft in seconds.
        </P>

        <H3>Potential Technical Architecture</H3>
        <P>
          A practical implementation using Power Query could work as follows:
        </P>
        <StepList
          steps={[
            {
              title: 'Excel creates the analytical dataset',
              body: (
                <>
                  <p className="mb-2">
                    Existing formulas, VBA or Power Query produce a clean table
                    containing the metrics the A.I. needs.
                  </p>
                  <p>
                    A.I. should generally not be asked to recalculate values that
                    Excel already calculates reliably.
                  </p>
                </>
              ),
            },
            {
              title: 'Power Query packages the dataset',
              body: (
                <>
                  <p className="mb-3">
                    Power Query converts the required rows into JSON. For
                    example:
                  </p>
                  <CodeBlock>{`{
  "period": "July 2026",
  "business_units": [
    {
      "name": "Auckland",
      "actual": 842000,
      "budget": 790000,
      "prior_year": 765000,
      "margin": 0.31,
      "volume": 4220
    }
  ]
}`}</CodeBlock>
                </>
              ),
            },
            {
              title: 'Power Query calls the XLS Experts API',
              body: (
                <ul className="space-y-1">
                  <li>
                    The workbook sends an HTTPS request to a secured Google Cloud
                    endpoint.
                  </li>
                  <li>
                    The workbook does not need to contain the OpenAI API key.
                  </li>
                  <li>
                    Authentication can instead be handled between the workbook
                    and our API.
                  </li>
                </ul>
              ),
            },
            {
              title: 'The API prepares the A.I. request',
              body: (
                <>
                  <p className="mb-2">
                    The cloud service adds controlled instructions such as:
                  </p>
                  <BulletList
                    items={[
                      'Analyse performance only from supplied data',
                      'Do not invent explanations that cannot be supported by the data',
                      'Identify material movements',
                      'Distinguish facts from possible causes',
                      'Write for a senior management audience',
                      'Return one summary per business unit',
                      'Return structured JSON',
                    ]}
                  />
                </>
              ),
            },
            {
              title: 'A.I. returns structured results',
              body: (
                <>
                  <p className="mb-3">For example:</p>
                  <CodeBlock>{`{
  "business_units": [
    {
      "name": "Auckland",
      "status": "Positive",
      "priority": "Medium",
      "summary": "...",
      "key_observations": [
        "...",
        "..."
      ]
    }
  ]
}`}</CodeBlock>
                </>
              ),
            },
            {
              title: 'Power Query expands the response',
              body: (
                <>
                  <p className="mb-2">
                    Power Query converts the JSON back into rows and columns. The
                    resulting table can then feed:
                  </p>
                  <BulletList
                    items={[
                      'Management reports',
                      'Dashboard commentary',
                      'Board packs',
                      'Monthly reporting templates',
                      'Exception reports',
                      'Automated emails',
                    ]}
                  />
                </>
              ),
            },
          ]}
        />

        <H3>Important Design Principle</H3>
        <P>
          The A.I. should interpret the data rather than become the calculation
          engine.
        </P>
        <P>
          For example, Excel should calculate that revenue is 7.9% below budget.
          A.I. should explain whether that movement appears noteworthy in the
          context provided.
        </P>
        <P>
          This separation makes the workflow considerably more auditable.
        </P>

        <H3>Additional Possibilities</H3>
        <P>The same architecture can produce:</P>
        <BulletList
          items={[
            'One-line commentary per row',
            'Detailed commentary only for exceptions',
            'Executive summaries covering the entire dataset',
            'Risk classifications',
            'Suggested questions for management to investigate',
            'Positive and negative performance highlights',
            'Commentary written differently for management, customers or operational teams',
          ]}
        />
        <P>
          The workbook remains an Excel reporting solution. A.I. simply adds a new
          interpretation layer that would traditionally require significant human
          effort.
        </P>
      </SectionShell>

      {/* Use Case 2 */}
      <SectionShell id="classification" alt>
        <UseCaseHeader
          number="2"
          title="A.I. Classification and Coding of Unstructured Business Data"
          subtitle="Turn descriptions, notes and free text into structured Excel data"
        />
        <P>
          A common limitation of traditional Excel automation occurs when a
          workflow contains human language.
        </P>
        <P>Excel can easily process:</P>
        <p className="mb-4 font-mono text-sm font-semibold text-gray-800">
          Invoice number: 48392
        </p>
        <P>It has much more difficulty interpreting:</P>
        <Quote>
          “Customer called again. Unit making intermittent rattling noise after
          compressor replacement. Technician needs to inspect mounting and fan
          assembly.”
        </Quote>
        <P>Businesses frequently maintain Excel datasets containing:</P>
        <BulletList
          items={[
            'Job descriptions',
            'Customer comments',
            'Complaint notes',
            'Maintenance descriptions',
            'Purchase descriptions',
            'General ledger narratives',
            'Survey responses',
            'Incident reports',
            'CRM notes',
            'Email subjects',
            'Product descriptions',
          ]}
        />
        <P>
          A human can usually classify these immediately. Traditional formulas or
          VBA generally require increasingly complicated keyword rules. A.I.
          provides another approach.
        </P>

        <H3>Example — Maintenance Job Classification</H3>
        <P>
          Suppose a service company exports 12,000 historical job descriptions
          from its operational system. Management wants to understand equipment
          type, fault category, probable component, whether the issue is
          installation, maintenance or breakdown, severity, and whether the
          description indicates repeat work.
        </P>
        <P>The source may contain:</P>
        <DataTable
          headers={['Job ID', 'Technician Notes']}
          rows={[
            [
              '10341',
              'Compressor trips after approx 15 min. Customer says problem started yesterday.',
            ],
            [
              '10342',
              'Annual preventative maintenance completed. Filters replaced and coils cleaned.',
            ],
            [
              '10343',
              "Returned following last week's repair. Fan still making excessive vibration.",
            ],
          ]}
        />
        <P>A.I. could return:</P>
        <DataTable
          headers={[
            'Job ID',
            'Work Type',
            'Fault Category',
            'Component',
            'Repeat Visit',
          ]}
          rows={[
            [
              '10341',
              'Breakdown',
              'Electrical/Overload',
              'Compressor',
              'No',
            ],
            [
              '10342',
              'Preventative Maintenance',
              'Scheduled Service',
              'Multiple',
              'No',
            ],
            [
              '10343',
              'Breakdown',
              'Mechanical/Vibration',
              'Fan',
              'Yes',
            ],
          ]}
        />
        <P>
          The organisation suddenly has structured analytical data that did not
          previously exist.
        </P>

        <H3>Potential Technical Structure</H3>
        <P>
          This is particularly suitable for a Power Query batch process.
        </P>
        <StepList
          steps={[
            {
              title: 'Import the source data',
              body: (
                <>
                  <p className="mb-2">Power Query imports records from:</p>
                  <BulletList
                    items={[
                      'Excel tables',
                      'CSV files',
                      'SQL databases',
                      'SharePoint',
                      'APIs',
                      'ERP exports',
                      'CRM exports',
                    ]}
                  />
                </>
              ),
            },
            {
              title: 'Conventional preprocessing',
              body: (
                <p>
                  Power Query can first remove unnecessary information, clean
                  text and assign unique record IDs. Potentially sensitive columns
                  can be excluded before anything is sent externally.
                </p>
              ),
            },
            {
              title: 'Send records in controlled batches',
              body: (
                <>
                  <p className="mb-3">
                    Instead of sending 12,000 requests individually, the API can
                    process batches. For example:
                  </p>
                  <CodeBlock>{`{
  "records": [
    {
      "id": "10341",
      "description": "Compressor trips after approx 15 min..."
    },
    {
      "id": "10342",
      "description": "Annual preventative maintenance..."
    }
  ]
}`}</CodeBlock>
                </>
              ),
            },
            {
              title: 'A.I. applies a predefined classification taxonomy',
              body: (
                <>
                  <p className="mb-2">
                    Rather than simply asking “What category is this?”, the
                    application can provide A.I. with the company&apos;s approved
                    categories. For example:
                  </p>
                  <p className="mb-1 font-semibold text-gray-800">Work Type</p>
                  <BulletList
                    items={[
                      'Installation',
                      'Preventative maintenance',
                      'Breakdown',
                      'Inspection',
                      'Warranty',
                      'Other',
                    ]}
                  />
                  <p className="mb-1 font-semibold text-gray-800">
                    Fault Category
                  </p>
                  <BulletList
                    items={[
                      'Electrical',
                      'Mechanical',
                      'Refrigeration',
                      'Controls',
                      'Leakage',
                      'Noise/Vibration',
                      'Unknown',
                    ]}
                  />
                  <p>This makes output much more consistent.</p>
                </>
              ),
            },
            {
              title: 'A.I. returns structured JSON',
              body: (
                <>
                  <p className="mb-3">The response can include:</p>
                  <CodeBlock>{`{
  "id": "10341",
  "work_type": "Breakdown",
  "fault_category": "Electrical",
  "component": "Compressor",
  "confidence": 0.91,
  "reason": "Description states compressor trips during operation."
}`}</CodeBlock>
                </>
              ),
            },
            {
              title: 'Excel receives the enriched dataset',
              body: (
                <>
                  <p className="mb-2">
                    Power Query expands the JSON into additional columns beside
                    the original records. The resulting dataset can immediately
                    be analysed using:
                  </p>
                  <BulletList
                    items={[
                      'PivotTables',
                      'Charts',
                      'Power Query',
                      'Excel formulas',
                      'Existing VBA reporting',
                      'Downstream databases',
                    ]}
                  />
                </>
              ),
            },
          ]}
        />

        <H3>Confidence and Exception Handling</H3>
        <P>A.I. does not need to be trusted blindly. A useful implementation could specify:</P>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Confidence ≥ 90%',
              body: 'Automatically accept classification.',
            },
            {
              title: 'Confidence 70–89%',
              body: 'Accept but flag for review.',
            },
            {
              title: 'Confidence < 70%',
              body: 'Send to an exception worksheet for human classification.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="font-display mb-2 text-sm font-bold text-gray-900">
                {card.title}
              </p>
              <p className="text-sm text-gray-600">{card.body}</p>
            </div>
          ))}
        </div>
        <P>
          Human corrections can also be retained. Over time, those examples can
          become part of the context supplied to the model.
        </P>

        <H3>Where This Can Be Used</H3>
        <P>The same architecture can classify:</P>
        <BulletList
          items={[
            'Bank transactions into accounting categories',
            'Customer enquiries by department',
            'Complaints by cause',
            'Insurance claims by incident type',
            'Product descriptions into product families',
            'Sales opportunities by industry',
            'Maintenance notes by failure mode',
            'Employee feedback by topic',
            'Procurement descriptions by spend category',
            'Health and safety reports by incident type',
          ]}
        />
        <P>
          A previously unstructured text column becomes structured business
          intelligence.
        </P>
      </SectionShell>

      {/* Use Case 3 */}
      <SectionShell id="extraction">
        <UseCaseHeader
          number="3"
          title="A.I. Extraction from Emails, PDFs and Documents into Excel"
          subtitle="Convert documents people read manually into structured spreadsheet records"
        />
        <P>
          A large amount of business information enters organisations through
          documents rather than databases.
        </P>
        <P>Examples include:</P>
        <BulletList
          items={[
            'Supplier quotations',
            'Purchase orders',
            'Customer emails',
            'Insurance claims',
            'Engineering specifications',
            'Tender documents',
            'Statements',
            'Contracts',
            'Application forms',
            'Inspection reports',
            'PDF schedules',
            'Delivery documents',
          ]}
        />
        <P>
          Employees then manually read those documents and type selected
          information into Excel. That is precisely the type of workflow where A.I.
          can sit between an unstructured document and an existing Excel process.
        </P>

        <H3>Example — Supplier Quotation Processing</H3>
        <P>
          An engineering business requests quotes from several suppliers. Each
          supplier responds differently. One PDF may state:
        </P>
        <Quote>
          UB 310 x 46.2 — 12 metres — Qty 6 — $1,287.50 each
          <br />
          Hot-dip galvanising additional $145.00 per item
          <br />
          Freight Auckland $385
          <br />
          Quote valid 30 days.
        </Quote>
        <P>
          Another supplier may send the same information in an email using
          completely different terminology. The company&apos;s Excel workbook
          needs columns such as Supplier, Product, Length, Qty, Unit Price,
          Galv, Freight and Valid Until.
        </P>
        <P>
          Historically somebody reads every quote and rekeys the information. A.I.
          can convert the documents into that structure.
        </P>

        <H3>Potential Technical Architecture</H3>
        <P>This workflow is often best controlled through VBA.</P>
        <StepList
          steps={[
            {
              title: 'User selects the source material',
              body: (
                <>
                  <p className="mb-2">
                    An Excel interface could allow users to select one or more
                    PDF files, an email attachment directory, paste email text,
                    or select files from a network location.
                  </p>
                  <p>
                    VBA sends the documents or extracted text to the cloud API.
                    Alternatively, the process may be triggered outside Excel and
                    Excel simply retrieves the completed dataset later.
                  </p>
                </>
              ),
            },
            {
              title: 'Cloud service extracts document content',
              body: (
                <>
                  <p className="mb-2">
                    Depending on document type, the API layer may use:
                  </p>
                  <BulletList
                    items={[
                      'Native document text',
                      'PDF parsing',
                      'OCR where required',
                      'Email body extraction',
                      'Spreadsheet parsing',
                    ]}
                  />
                  <p>
                    The extracted content is passed to the A.I. model along with a
                    strict schema.
                  </p>
                </>
              ),
            },
            {
              title: 'A.I. maps the document into the required fields',
              body: (
                <>
                  <p className="mb-3">
                    Instead of returning prose, the model is instructed to return
                    something such as:
                  </p>
                  <CodeBlock>{`{
  "supplier": "ABC Steel",
  "quote_number": "Q-44892",
  "quote_date": "2026-08-04",
  "valid_until": "2026-09-03",
  "currency": "NZD",
  "items": [
    {
      "description": "UB 310 x 46.2",
      "length_mm": 12000,
      "quantity": 6,
      "unit_price": 1287.50
    }
  ],
  "galvanising": 870,
  "freight": 385
}`}</CodeBlock>
                </>
              ),
            },
            {
              title: 'API validates the response',
              body: (
                <>
                  <p className="mb-2">
                    Before Excel receives anything, conventional program logic
                    can validate:
                  </p>
                  <BulletList
                    items={[
                      'Required fields exist',
                      'Dates are valid',
                      'Numbers are numeric',
                      'Quantity × unit price calculations reconcile where appropriate',
                      'Currency is recognised',
                      'Duplicate quote numbers have not already been processed',
                    ]}
                  />
                </>
              ),
            },
            {
              title: 'VBA writes the records into the existing workbook',
              body: (
                <>
                  <p className="mb-2">The data may populate:</p>
                  <BulletList
                    items={[
                      'Quote comparison worksheets',
                      'Procurement models',
                      'Estimating systems',
                      'Accounts payable templates',
                      'Material schedules',
                      'Project costing worksheets',
                    ]}
                  />
                  <p>
                    The user&apos;s downstream process can remain unchanged.
                  </p>
                </>
              ),
            },
          ]}
        />

        <H3>A.I. Can Also Preserve Source Evidence</H3>
        <P>
          A particularly useful implementation is to return not only the
          extracted value but its evidence. For example:
        </P>
        <CodeBlock>{`{
  "field": "freight",
  "value": 385,
  "source_text": "Freight Auckland $385",
  "confidence": 0.98
}`}</CodeBlock>
        <P>
          The Excel interface can then allow the user to review questionable
          records.
        </P>

        <H3>Resolving Ambiguous Information</H3>
        <P>
          Suppose a quote says: “Delivery approximately 3 weeks from order.”
          There is no fixed delivery date. Rather than inventing one, the A.I. can
          return:
        </P>
        <CodeBlock>{`{
  "delivery_date": null,
  "delivery_terms": "Approximately 3 weeks from order",
  "requires_review": true
}`}</CodeBlock>
        <P>
          This is an important difference between a controlled business
          application and simply asking ChatGPT to read a document.
        </P>

        <H3>Broader Applications</H3>
        <P>The same pattern could be used to extract:</P>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: 'Insurance',
              body: 'Claim number, policyholder, event date, incident type, claimed amount.',
            },
            {
              title: 'Property',
              body: 'Address, tenant, rent, lease expiry, review dates and clauses.',
            },
            {
              title: 'Construction',
              body: 'Tender requirements, quantities, dates, exclusions and specifications.',
            },
            {
              title: 'Finance',
              body: 'Invoice number, supplier, GST, line items and payment terms.',
            },
            {
              title: 'Logistics',
              body: 'Shipment numbers, container details, ETAs and delivery locations.',
            },
            {
              title: 'Human Resources',
              body: 'Applicant skills, qualifications and employment history.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-gray-50 p-5"
            >
              <p className="font-display mb-2 text-sm font-bold text-gray-900">
                {card.title}
              </p>
              <p className="text-sm text-gray-600">{card.body}</p>
            </div>
          ))}
        </div>
        <P>
          A.I. becomes a translation layer between the documents the business
          receives and the structured Excel system it already uses.
        </P>
      </SectionShell>

      {/* Use Case 4 */}
      <SectionShell id="data-quality" alt>
        <UseCaseHeader
          number="4"
          title="A.I.-Assisted Data Quality, Anomaly Investigation and Exception Management"
          subtitle="Go beyond finding bad data and help users understand it"
        />
        <P>
          Excel and Power Query are very good at finding deterministic problems
          — blank customer IDs, invalid dates, duplicate invoice numbers,
          negative quantities, amounts outside a specified range.
        </P>
        <P>But many business data problems are contextual. Consider these examples:</P>
        <BulletList
          items={[
            'A customer normally orders $4,000 per month but suddenly orders $70,000.',
            'A freight charge is technically valid but unusually high relative to the order.',
            'A product description does not match its assigned product category.',
            'An expense appears to have been coded incorrectly based on its narrative.',
            'A maintenance job looks suspiciously similar to a recently completed warranty job.',
            'An employee appears to have submitted several slightly different versions of the same expense.',
          ]}
        />
        <P>
          Traditional rules may identify some of these. A.I. can add another level
          of review.
        </P>

        <H3>Example — Financial Transaction Review</H3>
        <P>
          Suppose an Excel reconciliation process contains 20,000 transactions.
          Existing Power Query logic first calculates conventional indicators
          such as amount versus historical average, duplicate references, missing
          fields, unusual supplier, weekend transaction, account code changes and
          GST inconsistencies.
        </P>
        <P>
          Only potentially unusual records are sent to A.I.. This is much more
          efficient than asking A.I. to examine everything.
        </P>

        <H3>Hybrid Architecture</H3>
        <P>
          The strongest architecture combines conventional logic and A.I..
        </P>
        <div className="mb-8 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="font-display mb-2 text-base font-bold text-gray-900">
              Layer 1 — Excel / Power Query rules
            </p>
            <P>
              The workbook performs all obvious deterministic tests. For example:
            </P>
            <CodeBlock>{`IF Amount > AverageSupplierTransaction * 4
THEN Flag = TRUE`}</CodeBlock>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="font-display mb-2 text-base font-bold text-gray-900">
              Layer 2 — A.I. contextual assessment
            </p>
            <P>
              Only flagged records are packaged with relevant context. For
              example:
            </P>
            <CodeBlock>{`{
  "transaction": {
    "supplier": "ABC Logistics",
    "amount": 12450,
    "description": "Urgent air freight project 4482"
  },
  "supplier_history": {
    "average_transaction": 2100,
    "largest_previous_transaction": 4800
  },
  "project": {
    "project_id": "4482",
    "status": "Urgent customer delivery"
  }
}`}</CodeBlock>
            <P>The A.I. might respond:</P>
            <CodeBlock>{`{
  "risk": "Medium",
  "classification": "Unusual but potentially explainable",
  "reason": "Transaction is 5.9x normal supplier spend but description references urgent air freight against an active project.",
  "recommended_action": "Confirm project 4482 required expedited freight."
}`}</CodeBlock>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="font-display mb-2 text-base font-bold text-gray-900">
              Layer 3 — Human review
            </p>
            <P>
              Excel presents an exception screen with columns for Transaction,
              Rule Triggered, A.I. Assessment, Recommendation and User Decision.
              The user can then select: Accept, Investigate, Correct or Escalate.
            </P>
          </div>
        </div>

        <H3>Why This Works Better Than Pure A.I.</H3>
        <P>
          A.I. is not being asked to discover anomalies blindly. Conventional
          calculations identify the statistical or rules-based exceptions. A.I.
          then helps answer:{' '}
          <strong className="font-semibold text-gray-800">
            “Does this exception make sense in context?”
          </strong>
        </P>
        <P>That division of responsibility reduces:</P>
        <BulletList
          items={[
            'API cost',
            'Processing time',
            'Hallucination risk',
            'Unnecessary A.I. decisions',
          ]}
        />
        <P>while increasing the usefulness of the review.</P>

        <H3>A.I. Can Also Identify Semantic Inconsistencies</H3>
        <P>
          Consider a procurement dataset where the description says “Stainless
          steel fasteners M12 316 grade” but the assigned category is “Electrical
          Components.” There may be nothing numerically wrong with the record —
          A.I. can recognise that the description and classification are
          inconsistent.
        </P>
        <P>
          Similarly, an invoice description of “Annual Microsoft Azure
          subscription” coded to “Vehicle Repairs” may have a perfectly
          reasonable amount while the semantic classification is not.
        </P>

        <H3>Possible Applications</H3>
        <BulletList
          items={[
            'Financial reconciliations',
            'Expense reviews',
            'Accounts payable',
            'Inventory records',
            'Customer master data',
            'Procurement analysis',
            'Payroll exception workflows',
            'Warranty claims',
            'Insurance claims',
            'Compliance reporting',
            'Operational audit processes',
          ]}
        />

        <H3>A.I.-Generated Investigation Notes</H3>
        <P>
          The system can also automatically create audit-friendly commentary:
        </P>
        <Quote>
          Transaction 884392 was flagged because its value was 5.9 times the
          supplier&apos;s 12-month average. The description references urgent air
          freight for Project 4482. Human confirmation is recommended before
          approval.
        </Quote>
        <P>
          These notes can be retained alongside the user&apos;s decision. This
          turns a traditional exception report into an assisted investigation
          workflow.
        </P>
      </SectionShell>

      {/* Use Case 5 */}
      <SectionShell id="assistant">
        <UseCaseHeader
          number="5"
          title="Natural-Language A.I. Assistant Inside an Existing Excel Application"
          subtitle="Let users ask questions about the workbook instead of navigating every report"
        />
        <P>
          Some Excel applications become substantial business systems. They can
          contain numerous worksheets, thousands of records, PivotTables,
          reports, VBA interfaces, configuration tables, pricing calculations,
          project information and historical transactions.
        </P>
        <P>
          Experienced users may understand them well. Occasional users often do
          not. A.I. can provide a conversational layer over the application without
          replacing the underlying workbook.
        </P>

        <H3>Example</H3>
        <P>
          Consider an Excel-based project costing application. Instead of
          navigating several worksheets, a project manager could type:
        </P>
        <Quote>
          Which projects are currently forecast to exceed their approved labour
          budget?
        </Quote>
        <P>
          The application gathers the relevant structured data and sends it to
          the A.I. service. The response might be:
        </P>
        <Quote>
          Three active projects are currently forecast above approved labour
          budget:
          <br />
          <br />
          • Project 4482 — forecast 18% over budget
          <br />
          • Project 4511 — forecast 11% over budget
          <br />
          • Project 4467 — forecast 7% over budget
          <br />
          <br />
          Project 4482 represents the largest exposure, with approximately
          $38,400 of forecast labour overspend.
        </Quote>
        <P>The user could then ask “Why is 4482 running over?” and receive:</P>
        <Quote>
          The principal driver is installation labour. Actual hours are already
          at 82% of budget while the project is only 61% complete. Drafting and
          procurement remain close to budget.
        </Quote>

        <H3>The Important Architectural Constraint</H3>
        <P>
          The A.I. should not receive the entire workbook and be expected to
          understand everything. Instead, VBA acts as the application controller.
        </P>
        <StepList
          steps={[
            {
              title: 'User asks a question',
              body: (
                <p>
                  A worksheet or VBA UserForm contains an “Ask the workbook”
                  interface.
                </p>
              ),
            },
            {
              title: 'VBA sends the question to the cloud API',
              body: (
                <CodeBlock>{`{
  "workbook": "Project Costing",
  "user_question": "Which projects are forecast over labour budget?"
}`}</CodeBlock>
              ),
            },
            {
              title: 'A.I. determines what information is required',
              body: (
                <>
                  <p className="mb-3">
                    The service may classify the request as:
                  </p>
                  <CodeBlock>{`{
  "intent": "project_labour_variance",
  "required_dataset": "active_project_cost_summary"
}`}</CodeBlock>
                </>
              ),
            },
            {
              title: 'VBA retrieves the approved dataset',
              body: (
                <>
                  <p className="mb-2">
                    Rather than giving A.I. unrestricted access, Excel sends a
                    predefined table containing:
                  </p>
                  <BulletList
                    items={[
                      'Project number',
                      'Project name',
                      'Labour budget',
                      'Labour actual',
                      'Forecast labour',
                      'Project completion percentage',
                    ]}
                  />
                </>
              ),
            },
            {
              title: 'A.I. analyses only that data',
              body: (
                <p>
                  The model generates the answer from the controlled dataset.
                </p>
              ),
            },
            {
              title: 'Excel displays the response',
              body: (
                <>
                  <p className="mb-2">The response can appear:</p>
                  <BulletList
                    items={[
                      'In a worksheet panel',
                      'In a VBA UserForm',
                      'In a task-oriented report',
                      'As generated commentary',
                      'As a new worksheet containing supporting records',
                    ]}
                  />
                </>
              ),
            },
          ]}
        />

        <H3>A.I. Can Trigger Existing VBA Functions</H3>
        <P>
          The assistant could eventually become more than a reporting interface.
          A user might ask: “Prepare the monthly project variance report for
          Auckland.” The A.I. interprets the instruction:
        </P>
        <CodeBlock>{`{
  "action": "generate_variance_report",
  "region": "Auckland",
  "period": "current_month"
}`}</CodeBlock>
        <P>
          VBA then executes the existing approved procedure. The model does{' '}
          <strong className="font-semibold text-gray-800">
            not
          </strong>{' '}
          write arbitrary VBA and execute it. Instead, it selects from controlled
          actions such as generate report, refresh data, filter project, create
          PDF, draft commentary, find customer or display exceptions. This is
          substantially safer.
        </P>

        <H3>Natural Language Search</H3>
        <P>
          The same mechanism is extremely useful for locating information. A user
          could ask: “Find the order where the customer complained about damaged
          packaging sometime around March.” Traditional Excel search requires
          knowing precisely what to search for. A.I. can interpret approximate
          language and identify likely records.
        </P>

        <H3>Explain Existing Results</H3>
        <P>
          Users might also ask “Why is this price $18,420?” The VBA application
          can collect the calculation components:
        </P>
        <CodeBlock>{`Materials      $8,420
Labour         $4,800
Subcontractors $1,600
Freight          $540
Markup          $3,060`}</CodeBlock>
        <P>
          A.I. then translates the calculation into an explanation. The calculation
          still comes from the Excel pricing engine — A.I. simply explains it.
        </P>

        <H3>Potential Applications</H3>
        <BulletList
          items={[
            'Estimating workbooks',
            'Financial models',
            'Operational applications',
            'Inventory systems',
            'Project management workbooks',
            'Engineering calculations',
            'Property development models',
            'Sales reporting',
            'Management reporting',
            'Resource planning tools',
          ]}
        />

        <H3>Security and Governance</H3>
        <P>Enterprise implementations can control:</P>
        <BulletList
          items={[
            'Which workbook functions A.I. may invoke',
            'Which datasets each user may access',
            'How much information is sent externally',
            'Which A.I. provider is used',
            'Prompt versions',
            'API request history',
            'User identity',
            'Response logging',
            'Retention rules',
          ]}
        />
        <P>
          Sensitive identifiers can also be replaced with internal IDs before
          data leaves the organisation.
        </P>

        <H3>The Result</H3>
        <P>
          Users continue working inside Excel. Existing formulas, VBA, Power
          Query and business rules remain intact. A.I. provides a new interface for
          interpreting information and interacting with the application.
        </P>
        <P>
          Instead of replacing a mature Excel system, it makes that system
          considerably easier to use.
        </P>
      </SectionShell>

      {/* Common architecture */}
      <SectionShell id="common-architecture" alt>
        <H2>A Common Architecture Across All Five Use Cases</H2>
        <P>
          Although the business applications differ, the underlying technical
          pattern can be highly reusable.
        </P>

        <div className="mt-8 space-y-4">
          {[
            {
              title: 'Excel Layer',
              body: 'User interface, calculations, existing VBA workflows, Power Query transformations, local business logic, tables and reports.',
            },
            {
              title: 'Integration Layer',
              body: 'VBA or Power Query selects approved data, converts it to JSON, calls an HTTPS endpoint, receives JSON, validates the basic response and places results back into Excel.',
            },
            {
              title: 'XLS Experts Cloud API',
              body: 'A Google Cloud service providing authentication, OpenAI connectivity, prompt management, model selection, request validation, response schemas, logging, rate limiting, error handling, data masking and usage monitoring.',
            },
            {
              title: 'A.I. Layer',
              body: 'Interpretation, classification, extraction, summarisation, explanation, contextual assessment and natural-language interaction.',
            },
            {
              title: 'Structured Response',
              body: 'Wherever possible, the model returns defined JSON rather than uncontrolled text.',
            },
            {
              title: 'Excel Application',
              body: 'Results become additional table columns, commentary, exceptions, classifications, extracted records, user-facing answers or inputs into the next stage of the existing workflow.',
            },
          ].map((layer, index) => (
            <div key={layer.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#1a6b3c' }}
                >
                  {index + 1}
                </span>
                {index < 5 && (
                  <span className="mt-1 w-px flex-1 bg-[#c5e0d0]" aria-hidden />
                )}
              </div>
              <div className="mb-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-display mb-1 text-base font-bold text-gray-900">
                  {layer.title}
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {layer.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border-l-4 border-[#1a6b3c] bg-white px-6 py-5 shadow-sm">
          <p className="text-base leading-relaxed text-gray-800">
            The important point is that{' '}
            <strong className="font-semibold">
              A.I. becomes another controlled service available to Excel — not a
              replacement for Excel
            </strong>
            . That gives businesses a practical way to introduce A.I. into
            established operational workflows without rebuilding mature systems
            from scratch.
          </p>
        </div>
      </SectionShell>

      <section className="border-y border-[#c5e0d0] bg-[#e8f5ee]/50 py-12">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-display text-xl font-bold text-gray-900">
            Related services
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
            These use cases sit alongside our A.I. workflow, VBA, Power Query and
            enterprise Excel services.
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {useCasesRelatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex rounded-lg border border-[#1a6b3c]/30 bg-white px-4 py-2 text-sm font-semibold text-[#1a6b3c] transition-colors hover:bg-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="py-16 text-center"
        style={{ backgroundColor: '#1a6b3c' }}
      >
        <div className="mx-auto max-w-xl px-6">
          <h2 className="font-display mb-4 text-3xl font-bold text-white">
            Which of these patterns fits your workbook?
          </h2>
          <p className="mb-8 text-white/80">
            Tell us about the Excel process you already rely on — we will
            identify where a secure A.I. layer can add the most value without
            replacing what works.
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
  )
}
