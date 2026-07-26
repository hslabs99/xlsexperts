import type { Metadata } from 'next'
import { marketPageMetadata, marketServiceSchema } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight, Database, Globe, RefreshCw, Users } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/excel-integrations',
    title: 'Excel Integrations (SQL, API, etc.) NZ | XLS Experts',
    description:
      'Connect Excel to SQL databases, REST APIs, cloud platforms and third-party software. VBA and Power Query integrations with live refresh, write-back and multi-user database-backed Excel apps for New Zealand businesses.',
    ogTitle: 'Excel Integrations (SQL, API, etc.) NZ | XLS Experts',
    ogDescription:
      'VBA and Power Query integrations connecting Excel to SQL databases, REST APIs, e-commerce platforms and legacy software. Multi-user database-backed Excel applications for New Zealand businesses.',
  })
}

const problems = [
  {
    heading: 'Your software cannot do what you need — and cannot be changed',
    body: 'Third-party platforms like Simpro, Xero, MYOB, and industry-specific tools are built for their core purpose — not yours. Requesting changes is slow, expensive, and often refused. The data exists in the system; getting it out and working with it is the problem.',
  },
  {
    heading: 'Exports, manual re-entry, and re-uploads waste hours every week',
    body: 'Teams download data from one system, reformat it in Excel, perform analysis or data massaging, then re-upload it. Each step is manual, error-prone, and invisible to the source system. A structured integration eliminates the re-entry and the errors it introduces.',
  },
  {
    heading: 'Excel is isolated from live data',
    body: 'Reports and dashboards built in Excel go stale the moment they are saved. Without a live connection to the database or platform driving your business, every decision is based on yesterday\'s data. Real-time or scheduled refreshes change this.',
  },
  {
    heading: 'Multiple teams pull the same data and get different numbers',
    body: 'Separate CSV extracts, different filters and timing mean finance, operations and analysts work from conflicting figures. A shared live SQL or API connection gives everyone the same source of truth.',
  },
  {
    heading: 'Multi-user data management hits Excel\'s limits',
    body: 'Shared workbooks are fragile. When multiple users need to read and write the same data simultaneously, Excel alone cannot handle it safely. Using a database as the data layer — with Excel as the front end — gives you multi-user capability without abandoning the tools your team knows.',
  },
  {
    heading: 'E-commerce and web platform data lives in silos',
    body: 'Order data, inventory levels, customer records, and fulfilment status sit in platforms like Shopify, WooCommerce, or custom APIs. Pulling that data into Excel for analysis, reconciliation, or reporting requires an integration — not a manual export.',
  },
  {
    heading: 'Legacy applications have no modern reporting layer',
    body: 'Older business systems often have poor or no native reporting. The underlying data is there — in SQL Server, Access, or an exportable format — but surfacing it requires someone to bridge the gap between the legacy system and a usable reporting environment.',
  },
]

const integrationTypes = [
  {
    icon: Database,
    title: 'SQL Database Connectivity',
    body: 'Direct VBA and Power Query connections to SQL Server, MySQL, PostgreSQL, Oracle, SQLite, Azure SQL and Amazon RDS via ADO, ODBC or OLE DB. Read, write and update records from Excel without manual exports. We use parameterised queries, least-privilege accounts, error handling and connection design suited to your data volume and user count — on-premise or cloud.',
    examples: [
      'Live reporting dashboards pulling from SQL Server with one-click refresh',
      'Excel as a data entry front-end writing validated results back to a shared database',
      'Replacing Access databases with SQL Server-backed Excel applications',
      'On-premise and cloud SQL connections coordinated with your IT firewall and ODBC setup',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Third-Party Software — Export / Re-upload Workflows',
    body: 'For platforms that cannot be directly connected to — Simpro, Procore, industry-specific tools, legacy ERP systems — we build structured download-process-upload workflows. Data is pulled via export, transformed and validated in Excel using VBA, then re-uploaded in the exact format the platform requires, with reconciliation checks at each step.',
    examples: ['Simpro job cost data downloaded, reclassified in Excel, re-uploaded with corrected cost codes', 'MYOB transaction exports processed and reconciled against budget models', 'Tender pricing tools that export in the exact format required by procurement platforms'],
  },
  {
    icon: Globe,
    title: 'REST API and Web Service Integration',
    body: 'VBA can call REST APIs using WinHTTP or XMLHTTP, parse JSON and XML responses, and write results directly into Excel. Power Query adds a no-code layer for APIs that support standard authentication. We use both depending on the complexity of the data transformation required.',
    examples: ['Pulling live currency rates, commodity prices, or market data into financial models', 'Connecting to e-commerce APIs (Shopify, WooCommerce) to pull order, inventory, and customer data', 'Calling weather, logistics, or freight APIs to enrich operational reports'],
  },
  {
    icon: Users,
    title: 'Database-Backed Multi-User Excel Applications',
    body: 'Excel is an exceptional front-end for business users — familiar, flexible, and powerful. By storing data in SQL Server or another relational database and using VBA to handle all reads and writes, we build multi-user applications that look and feel like Excel but behave like proper database applications: concurrent access, record locking, audit trails, and no file corruption.',
    examples: ['Job management tools used by field and office teams simultaneously', 'Pricing engines where multiple estimators work from a shared database of rates and materials', 'Approval workflow tools where submitters and approvers see the same data in real time'],
  },
]

const steps = [
  {
    number: '01',
    title: 'Integration Discovery',
    body: 'We map the data flow — what system holds the data, what format it is in, what transformation is needed, and where it needs to go. We identify whether VBA, Power Query, or a combination is the right tool, and whether a direct connection is possible or a structured export-process-upload model is needed.',
  },
  {
    number: '02',
    title: 'Connection Architecture',
    body: 'We design the integration layer: connection strings, authentication method, query structure, error handling, and refresh schedule. For database-backed applications, we design the schema. For API integrations, we validate the authentication and rate limit constraints upfront.',
  },
  {
    number: '03',
    title: 'Build and Test',
    body: 'The integration is built against real data — not sample files. We test for volume, edge cases, malformed records, connection failures, and concurrent access. Error handling and user-facing messages are built in from the start, not added later.',
  },
  {
    number: '04',
    title: 'Handover and Documentation',
    body: 'You receive a working integration, documentation covering connection management, and guidance on maintaining the solution. For database-backed applications, we include a data dictionary and schema documentation your team can hand to any future developer.',
  },
]

const faqs = [
  {
    q: 'Which databases can Excel connect to?',
    a: 'Excel can connect to SQL Server, MySQL, PostgreSQL, Oracle, SQLite, Azure SQL, Amazon RDS, Google BigQuery and others via Power Query, ODBC, OLE DB or ADO. We advise on the right connection method for your specific database and environment — including on-premise networks where firewall and driver setup matter.',
  },
  {
    q: 'Can Excel connect directly to our SQL Server database?',
    a: 'Yes. VBA uses ADO (ActiveX Data Objects) to open a direct connection to SQL Server, MySQL, PostgreSQL, Oracle, and other databases. Excel can read, write, update, and delete records with full transactional control. Power Query provides an additional no-code layer for read-only queries where that is sufficient.',
  },
  {
    q: 'Is it secure to connect Excel directly to a database?',
    a: 'Yes, when configured correctly. We use connection strings with least-privilege database accounts, recommend read-only access for reporting connections, and can configure Windows Authentication rather than stored passwords. We document the security approach for your IT team.',
  },
  {
    q: 'Can Excel write data back to a SQL database?',
    a: 'Yes. Using VBA with ADO connections, Excel can insert, update or delete records. This is useful for data entry tools where validated data needs to flow back into a central system, and for multi-user applications where Excel is the front-end and the database is the source of truth.',
  },
  {
    q: 'Will a live database connection slow Excel down?',
    a: 'A well-designed connection uses parameterised queries that return only the data needed — this is generally faster than loading a full CSV export. We optimise queries for performance and test on your data volumes before delivery.',
  },
  {
    q: 'Simpro says we cannot access their API. What are our options?',
    a: 'Simpro and similar field service platforms often have limited or gated API access for their standard tiers. The practical alternative is a structured export-process-upload workflow: data is downloaded as CSV or Excel from Simpro, processed and transformed using VBA, then re-uploaded in the format Simpro accepts. We build these workflows to run reliably and include validation at every step to catch errors before they reach the system.',
  },
  {
    q: 'Can multiple people use the same Excel file at the same time?',
    a: 'Standard shared workbooks are unreliable for concurrent editing. The correct architecture for multi-user Excel applications is to store all data in a SQL database and use Excel purely as the front-end. VBA handles all reads and writes to the database, which supports concurrent access properly. The result looks and feels like Excel to users but behaves like a proper application.',
  },
  {
    q: 'How do you handle authentication for REST APIs?',
    a: 'VBA supports API key authentication, Basic authentication, OAuth 2.0 token-based flows, and custom header authentication via WinHTTP. For OAuth, we build a token refresh flow so credentials do not need to be re-entered. Power Query supports a similar range through its built-in web connector. We match the authentication method to what the API requires.',
  },
  {
    q: 'Can Excel pull live data from Shopify or WooCommerce?',
    a: 'Yes. Both platforms have well-documented REST APIs. We build VBA or Power Query connections that authenticate, paginate through results, and load order, product, inventory, or customer data directly into Excel. Refresh can be triggered manually or on a schedule using Task Scheduler.',
  },
  {
    q: 'What happens when the third-party software updates and breaks the integration?',
    a: 'API-based integrations are dependent on the API version and the provider\'s change management. We build integrations against stable API versions where available, include version pinning, and document all dependencies. For export-based workflows, changes to the export format are the most common break point — we design these to surface format mismatches clearly rather than silently processing incorrect data.',
  },
  {
    q: 'Do you work with cloud databases as well as on-premises SQL Server?',
    a: 'Yes. We connect Excel to cloud-hosted databases including Azure SQL Database, Amazon RDS, Supabase, PlanetScale, and others via standard ADO connection strings. The connection configuration differs slightly for cloud vs on-premises, and firewall and IP whitelisting requirements need to be managed — but the Excel and VBA layer is identical.',
  },
]

async function buildServiceSchema() {
  return marketServiceSchema({
    path: '/excel-integrations',
    name: 'Excel Integrations',
    description:
      'Connect Excel to SQL databases, REST APIs, cloud platforms and third-party software for New Zealand businesses.',
    serviceType: 'Excel Integrations',
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

export default async function ExcelIntegrationsPage() {
  const serviceSchema = await buildServiceSchema()
  const exampleTiles = await getServicePageTiles('/excel-integrations')
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
              Excel Integrations (SQL, API, etc.)
            </span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Connect Excel to your databases, APIs and business systems
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Your data lives in SQL Server, Simpro, Xero, Shopify and a dozen
              other systems. We connect Excel to all of them — live SQL
              refreshes, REST APIs and structured export workflows — so your
              team works in the tools they know, without manual CSV exports.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
            >
              Discuss your integration
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Problems */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              The integration problems we solve
            </h2>
            <p className="mb-12 text-center text-gray-500 max-w-2xl mx-auto">
              Most businesses have data spread across systems that were never designed to talk to each other. Excel is often the practical bridge.
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

        {/* Integration types */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              What we connect and how
            </h2>
            <p className="mb-12 text-center text-gray-500 max-w-2xl mx-auto">
              Different integration challenges require different approaches. We use VBA, Power Query, and direct database connections depending on what the situation calls for.
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              {integrationTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div key={type.title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#e8f5ee' }}>
                        <Icon className="h-5 w-5" style={{ color: '#1a6b3c' }} />
                      </div>
                      <h3 className="font-display font-bold text-gray-900">{type.title}</h3>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600">{type.body}</p>
                    <ul className="space-y-2">
                      {type.examples.map((ex) => (
                        <li key={ex} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: '#1a6b3c' }} />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <ServicePageExamples
          heading="SQL, API and platform integration examples"
          subheading="Live database connections and integration patterns we build most often for New Zealand businesses."
          tiles={exampleTiles}
        />

        {/* Process */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
              How we approach integrations
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl bg-white border border-gray-200 p-7 shadow-sm">
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: '#1a6b3c' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-display mb-2 font-bold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location relevance */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
              Excel integration consulting across New Zealand
            </h2>
            <p className="text-base leading-relaxed text-gray-500">
              We work with New Zealand businesses in construction, field
              services, manufacturing, retail, finance, logistics, insurance and
              government — industries where SQL databases and third-party
              platforms hold critical data but lack the flexibility to report and
              analyse it properly. Based in Auckland and working with clients
              nationwide, we connect Excel to on-premise and cloud SQL
              environments and coordinate with your IT team on access, firewall
              and ODBC configuration.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                  <h3 className="font-display mb-3 font-bold text-gray-900">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
