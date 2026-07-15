import { ArrowRight, CheckCircle2 } from 'lucide-react'

const trustPoints = [
  'Fixed-price, no surprises',
  '100% NZ-based team',
  'SMEs to enterprise — we work at your scale',
]

const clientNames = [
  'AMP',
  'Contact Energy',
  'NZI',
  'Fisher & Paykel Healthcare',
  'Auckland Transport',
  '1M',
  'Max Fashion',
  'Fulton Hogan',
  'Downer',
  'EQC',
  'ASB Bank',
  'Pullman Hotels',
]

const commonProjects = [
  'Financial Modelling/Dashboards',
  'Project Costing Calculators',
  'Resource Planning Tools',
  'Feasibility Studies',
  'Survey Tools',
  'Sales Team Automations',
  'Data Analysis',
  'Membership Systems',
  'GPS Tools',
  'E-commerce Extensions',
]

const badges = [
  'New Zealand Microsoft Excel Specialists',
  'Enterprise Applications',
  'A.I. Solutions',
]

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden bg-white pt-16"
    >
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      {/* Top green accent line below nav */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-16 h-[2px]"
        style={{ background: 'linear-gradient(to right, #1a6b3c 0%, #1a6b3c 6%, transparent 6%)' }}
      />

      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-20 text-center lg:pt-28">

        {/* Eyebrow badge strip */}
        <div className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: '#e8f5ee', color: '#1a6b3c' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#1a6b3c' }} aria-hidden="true" />
              {badge}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[56px]">
          We automate your{' '}
          <span style={{ color: '#1a6b3c' }}>Excel and Google spreadsheets,</span>{' '}
          data and business workflows.
        </h1>

        {/* Body copy */}
        <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-gray-500">
          Whether you&apos;re a solo engineer with a messy workbook or a finance team running
          business-critical models — we can assist in designing and building a spreadsheet,
          enterprise app or A.I. workflow solution.
        </p>

        {/* Trust checklist */}
        <ul
          className="mx-auto mt-7 flex flex-col items-start gap-2.5 sm:max-w-xs"
          aria-label="Key benefits"
        >
          {trustPoints.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#1a6b3c' }} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#contact"
            className="btn-primary inline-flex h-11 items-center gap-2 rounded-lg px-7 text-sm font-semibold shadow-sm"
          >
            Get a free quote
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#how-we-work"
            className="inline-flex h-11 items-center rounded-lg border border-gray-200 bg-white px-7 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            See how we work
          </a>
        </div>

        {/* Client name strip */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-700">
            Clients include
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {clientNames.map((name) => (
              <span
                key={name}
                className="border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-600"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Common projects */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-700">
            Common projects
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {commonProjects.map((project) => (
              <span
                key={project}
                className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-600"
              >
                {project}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative border-t border-gray-100" style={{ backgroundColor: '#f9fafb' }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px sm:grid-cols-4" style={{ backgroundColor: '#e5e7eb' }}>
          {[
            { value: '350+', label: 'Projects delivered' },
            { value: '20+', label: 'Years of expertise' },
            { value: '100% NZ', label: 'Based team, local expertise' },
            { value: 'Fixed Price', label: 'Fixed pricing available' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5 px-6 py-6 text-center" style={{ backgroundColor: '#f9fafb' }}>
              <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
