import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Discovery call',
    description:
      'We start with a free 30-minute call to understand your problem, your data, and what a good outcome looks like. No jargon, no sales pitch — just a straightforward conversation about what you need.',
    bg: '#1a6b3c',
    tint: '#e8f5ee',
  },
  {
    number: '02',
    title: 'Scoping & quote',
    description:
      'We send you a clear written scope of work and a fixed price or hourly estimate before anything starts. You know exactly what you are getting and what it will cost — no surprises.',
    bg: '#2d8653',
    tint: '#eef7f2',
  },
  {
    number: '03',
    title: 'Build & review',
    description:
      'We build in stages and share progress as we go. You get to review, give feedback, and request adjustments before the final delivery. Your input shapes the outcome.',
    bg: '#3fa068',
    tint: '#f2faf6',
  },
  {
    number: '04',
    title: 'Handover & support',
    description:
      'We deliver clean, well-documented work with a handover session so your team can actually use it. Ongoing support and enhancements are available whenever you need us.',
    bg: '#55b580',
    tint: '#f5fbf8',
  },
]

const principles = [
  'Plain English communication — no IT jargon',
  'You own everything we build, no lock-in',
  'We work with your existing tools and systems',
  'Available for both one-off projects and ongoing retainers',
]

export function HowWeWork() {
  return (
    <section id="how-we-work" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
            Our process
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How we work
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            Simple, transparent, and designed around you — whether this is your first time outsourcing a spreadsheet or you are running a complex enterprise rollout.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: '#d1d5db' }}>
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col gap-5 p-8"
              style={{ backgroundColor: step.tint }}
            >
              {/* Coloured top border accent */}
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: step.bg }} />

              {/* Step number */}
              <span
                className="text-5xl font-black leading-none tracking-tighter"
                style={{ color: step.bg, opacity: 0.18 }}
              >
                {step.number}
              </span>

              {/* Connector arrow — desktop only */}
              {index < steps.length - 1 && (
                <ArrowRight
                  className="absolute -right-3.5 top-10 z-10 hidden h-6 w-6 lg:block"
                  style={{ color: step.bg }}
                  aria-hidden="true"
                />
              )}

              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold" style={{ color: step.bg }}>{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Principles row */}
        <div className="mt-12 border border-gray-100 bg-gray-50 px-8 py-7">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {principles.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#1a6b3c' }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-gray-700">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm text-gray-500">
            Ready to get started?
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
