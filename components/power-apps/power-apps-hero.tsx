import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/solutions/breadcrumbs'
import { powerAppsCapabilities } from '@/lib/power-apps-page'

export function PowerAppsHero({
  h1 = 'Microsoft Power Apps & Dataverse Development',
  heroIntro,
}: {
  h1?: string
  heroIntro?: string
}) {
  const intro =
    heroIntro?.trim() ||
    'Many organisations already hold substantial business data, processes and security inside Microsoft products. The screens and workflows available out of the box do not always match how a particular team actually works. We design purpose-built applications around that workflow, using the Microsoft environment you already have.'

  return (
    <section
      id="overview"
      className="relative scroll-mt-28 overflow-hidden py-20 sm:py-24"
      style={{
        background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
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
            { label: 'Services', href: '/services' },
            { label: 'Microsoft Power Apps & Dataverse' },
          ]}
        />
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">
          Services
        </p>
        <h1 className="font-display mb-4 text-4xl font-bold leading-tight text-white text-balance md:text-5xl">
          {h1}
        </h1>
        <p className="font-display mb-5 max-w-3xl text-2xl font-semibold leading-snug text-white/95 text-balance md:text-3xl">
          Extend your Microsoft business ecosystem with custom applications built around the way
          your business actually works.
        </p>
        <p className="mb-8 max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
          {intro}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#consultation"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Discuss Your Power Apps Requirement
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#dynamics"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Talk to Us About Extending Dynamics
          </a>
        </div>
      </div>
    </section>
  )
}

export function PowerAppsCapabilityStrip() {
  return (
    <section className="border-b border-gray-200 bg-white py-8" aria-label="Capabilities">
      <div className="mx-auto max-w-5xl px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {powerAppsCapabilities.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm font-medium text-gray-800">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[#1a6b3c]"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-gray-500">
          Looking for{' '}
          <Link href="/services" className="font-medium text-[#1a6b3c] hover:underline">
            all services
          </Link>
          ,{' '}
          <Link href="/web-applications" className="font-medium text-[#1a6b3c] hover:underline">
            custom web applications
          </Link>
          {' '}or{' '}
          <Link
            href="/ai-workflow-and-business-process-automation"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            business process automation
          </Link>
          ?
        </p>
      </div>
    </section>
  )
}
