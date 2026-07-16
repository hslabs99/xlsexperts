import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Excel SQL Integration New Zealand | XLS Experts',
  description:
    'Connect Excel directly to your SQL database. We build Excel to SQL Server, MySQL, PostgreSQL and Oracle integrations for New Zealand businesses — live data, automated refresh, no manual exports.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/excel-sql-integration' },
  openGraph: {
    title: 'Excel SQL Integration New Zealand | XLS Experts',
    description: 'Connect Excel directly to SQL databases for NZ businesses. Live data, automated refresh, no manual exports.',
    url: 'https://www.xlsexperts.co.nz/excel-sql-integration',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'Exporting data from the database to CSV and importing into Excel manually each time',
  'Reports that are always one step behind because the data refresh is a manual process',
  'Data analysts writing reports from stale extracts rather than live data',
  'Multiple teams pulling the same data separately and getting different numbers',
  'No way for Excel to write processed results back to a database for other systems to use',
  'IT requests needed every time someone wants a new data extract',
]

const examples = [
  { tag: 'Finance', title: 'Live GL Reporting in Excel', detail: 'Excel connects directly to the general ledger database via Power Query — finance team refreshes reports in one click without IT involvement.' },
  { tag: 'Operations', title: 'Production Dashboard from ERP Database', detail: 'VBA queries the ERP SQL database, pulls current production data and updates a formatted Excel dashboard that refreshes every morning automatically.' },
  { tag: 'Insurance', title: 'Claims Analysis Tool', detail: 'Excel connected to the claims database via ADO — analysts can run custom queries from dropdown filters in Excel without writing SQL.' },
  { tag: 'Retail', title: 'Stock and Sales Reporting', detail: 'Power Query connects to the retail management SQL database, joins stock and sales tables and loads a pivot-ready dataset — replaces daily manual CSV extraction.' },
]

const steps = [
  {
    number: '01',
    title: 'Database and requirements review',
    points: ['Understand the database structure, version and access method', 'Identify tables, views and queries required', 'Agree connection method: Power Query, VBA/ADO or linked tables'],
    deliverable: 'Connection spec with query design, access approach and refresh mechanism.',
  },
  {
    number: '02',
    title: 'Build and optimise',
    points: ['Connection built and queries written — parameterised and efficient', 'Tested for performance with production data volumes', 'Error handling for connection failures and permission issues'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Security, documentation and handover',
    points: ['Connection credentials secured appropriately', 'User guide for the refresh process', 'IT documentation for network and firewall configuration'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'Which databases can Excel connect to?', a: 'Excel can connect to SQL Server, MySQL, PostgreSQL, Oracle, SQLite, Azure SQL, Amazon RDS, Google BigQuery and others via Power Query, ODBC, OLE DB or ADO connections. We advise on the right connection method for your specific database and environment.' },
  { q: 'Is it secure to connect Excel directly to a database?', a: 'Yes, when configured correctly. We use connection strings with least-privilege database accounts, recommend read-only access for reporting connections, and can configure connections to use Windows Authentication rather than stored passwords. We document the security approach for your IT team.' },
  { q: 'Can Excel write data back to a SQL database?', a: 'Yes. Using VBA with ADO connections, Excel can insert, update or delete records in a database. This is useful for data entry tools where validated data needs to flow back into a central system.' },
  { q: 'Will a live database connection slow Excel down?', a: 'A well-designed connection uses parameterised queries that return only the data needed — this is generally faster than loading a full CSV export. We optimise queries for performance and test on your data volumes before delivery.' },
  { q: 'Our database is on-premise — can we still connect?', a: 'Yes. On-premise SQL connections are standard. We confirm the network path, firewall rules and ODBC driver requirements with your IT team during scoping.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Excel SQL Integration',
  description: 'Connect Excel directly to SQL databases for New Zealand businesses. Live data, automated refresh, no manual exports.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/excel-sql-integration',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Excel SQL Integration',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default function ExcelSQLIntegrationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Excel SQL Integration</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Connect Excel directly to your database. No more manual exports.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              If your team is exporting CSV files and importing them into Excel every time they need fresh data, there is a better way. We connect Excel directly to SQL databases — SQL Server, MySQL, PostgreSQL, Oracle and more — so your reports always reflect live data with a single click refresh.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Data access problems we solve</h2>
            <p className="mb-12 text-center text-gray-500">Manual data extraction issues common across NZ businesses.</p>
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

        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Excel SQL integration projects</h2>
            <p className="mb-12 text-center text-gray-500">Live database connections built for New Zealand businesses.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {examples.map((ex) => (
                <div key={ex.title} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                  <span className="mb-3 inline-block rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">{ex.tag}</span>
                  <h3 className="font-display mb-2 text-lg font-bold text-gray-900">{ex.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{ex.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">From database access to live connected reports.</p>
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
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Excel SQL integration across New Zealand</h2>
            <p className="text-gray-600 leading-relaxed">We build Excel to SQL integrations for businesses throughout New Zealand — Auckland, Wellington, Christchurch, Hamilton and beyond. We work with on-premise and cloud SQL environments and coordinate with your IT team on access, firewall and ODBC configuration. Our integrations are used in finance, insurance, energy, retail, logistics and government organisations across New Zealand.</p>
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
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to connect Excel to your database?</h2>
            <p className="mb-8 text-white/80">Tell us about your database environment and reporting needs — we will scope the connection approach.</p>
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
