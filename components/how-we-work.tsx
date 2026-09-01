'use client'

import { ArrowRight } from 'lucide-react'
import { useMarketCopy } from '@/components/market-provider'

const STEP_STYLES = [
  { number: '01', bg: '#1a6b3c', tint: '#e8f5ee' },
  { number: '02', bg: '#2d8653', tint: '#eef7f2' },
  { number: '03', bg: '#3fa068', tint: '#f2faf6' },
  { number: '04', bg: '#55b580', tint: '#f5fbf8' },
] as const

export function HowWeWork() {
  const copy = useMarketCopy().howWeWork
  const steps = [
    {
      ...STEP_STYLES[0],
      title: copy.step1Title,
      description: copy.step1Description,
    },
    {
      ...STEP_STYLES[1],
      title: copy.step2Title,
      description: copy.step2Description,
    },
    {
      ...STEP_STYLES[2],
      title: copy.step3Title,
      description: copy.step3Description,
    },
    {
      ...STEP_STYLES[3],
      title: copy.step4Title,
      description: copy.step4Description,
    },
  ]
  const principles = [
    copy.principle1,
    copy.principle2,
    copy.principle3,
    copy.principle4,
  ]

  return (
    <section id="how-we-work" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
            {copy.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {copy.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            {copy.intro}
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
            {copy.ctaPrompt}
          </p>
          <a
            href="#contact"
            className="btn-primary inline-flex h-9 items-center rounded-sm px-5 text-sm font-medium"
          >
            {copy.ctaLabel}
          </a>
        </div>

      </div>
    </section>
  )
}
