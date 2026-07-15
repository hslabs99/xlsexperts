import { BarChart2, Bot, Code2, Database, FileSpreadsheet, Globe, LayoutDashboard, Workflow } from 'lucide-react'

const services = [
  {
    icon: FileSpreadsheet,
    title: 'Spreadsheet Design & Build',
    description:
      'From simple calculators to complex multi-sheet models — formulas, named ranges, data validation, and clean layouts that anyone on your team can use.',
    tags: ['Formulas', 'Data Validation', 'Templates'],
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboards & Reporting',
    description:
      'Interactive charts, pivot tables, and management dashboards that turn raw data into clear decisions. Connected to live data sources or refreshed on demand.',
    tags: ['Charts', 'Pivot Tables', 'Power Query'],
  },
  {
    icon: Code2,
    title: 'Macros & VBA Automation',
    description:
      'Eliminate repetitive manual work. We write clean, well-documented VBA code that automates your workflows, generates reports, and runs processes at the click of a button.',
    tags: ['VBA', 'Macros', 'Workflow Automation'],
  },
  {
    icon: Database,
    title: 'Data Connections & Integration',
    description:
      'Connect your spreadsheets to SQL databases, REST APIs, Shopify, Xero, and other business systems. Pull live data in, push results out — no more copy-paste.',
    tags: ['SQL', 'APIs', 'Power Query', 'EDI'],
  },
  {
    icon: Globe,
    title: 'Enterprise Web Applications',
    description:
      'Browser-based apps for multi-user, any-device access. Custom user roles, cloud databases, real-time analytics — with an Excel workbook for offline reporting.',
    tags: ['.NET', 'SQL DB', 'Mobile-ready'],
  },
  {
    icon: BarChart2,
    title: 'Financial Modelling',
    description:
      'Budgets, forecasts, feasibility studies, and fund management tools built to professional standards. Reliable models that stand up to scrutiny from finance teams and boards.',
    tags: ['Forecasting', 'Feasibility', 'Fund Management'],
  },
  {
    icon: Workflow,
    title: 'Business Process Automation',
    description:
      'End-to-end workflow automation connecting spreadsheets, cloud tools, and business software. Reduce manual effort, cut errors, and free your team for higher-value work.',
    tags: ['Google Sheets', 'Airtable', 'Zapier', 'Make'],
  },
  {
    icon: Bot,
    title: 'A.I. Workflow Solutions',
    description:
      'We integrate AI tools into your existing spreadsheet and data workflows — automated summarisation, data classification, anomaly detection, and intelligent reporting.',
    tags: ['AI Integration', 'OpenAI', 'Automation'],
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-28" style={{ backgroundColor: '#e8f5ee' }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
            What we do
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Services
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            Whether you need a quick formula fix or a full enterprise application, we have the expertise to deliver it — on time, on budget, and built to last.
          </p>
        </div>

        {/* Service cards */}
        <div className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: '#c5e0d0' }}>
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="group flex flex-col gap-4 bg-white p-7 transition-colors hover:bg-gray-50"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center"
                  style={{ backgroundColor: '#e8f5ee' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#1a6b3c' }} aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{service.description}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm text-gray-500">
            Not sure which service fits your need?
          </p>
          <a
            href="#contact"
            className="btn-primary inline-flex h-9 items-center rounded-sm px-5 text-sm font-medium"
          >
            Book a free discovery call
          </a>
        </div>

      </div>
    </section>
  )
}
