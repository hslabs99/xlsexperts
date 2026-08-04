import Link from 'next/link'
import { ArrowRight, Cloud, Monitor, Smartphone, Tablet } from 'lucide-react'
import { Breadcrumbs } from '@/components/solutions/breadcrumbs'
import { webAppCapabilities } from '@/lib/web-applications-page'

function DeviceComposition() {
  return (
    <div
      className="relative mx-auto mt-12 max-w-lg lg:mt-0 lg:max-w-none"
      aria-hidden="true"
    >
      <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
        {/* Desktop browser frame */}
        <div className="overflow-hidden rounded-xl border border-white/25 bg-[#0a2e1a]/80 shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="ml-3 flex-1 rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/50">
              app.yourbusiness.co.nz
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-3 sm:col-span-2">
              <div className="mb-2 h-2 w-24 rounded bg-white/30" />
              <div className="space-y-1.5">
                <div className="h-2 w-full rounded bg-white/15" />
                <div className="h-2 w-5/6 rounded bg-white/15" />
                <div className="h-2 w-4/6 rounded bg-white/15" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-10 rounded-md bg-[#1f7d46]/50" />
                <div className="h-10 rounded-md bg-white/10" />
                <div className="h-10 rounded-md bg-white/10" />
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-white/10 p-3">
              <div className="flex items-center gap-2 text-[10px] text-white/70">
                <Cloud className="h-3.5 w-3.5" /> Live data
              </div>
              <div className="h-2 w-full rounded bg-white/20" />
              <div className="h-2 w-4/5 rounded bg-white/15" />
              <div className="mt-2 flex -space-x-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-[#1a6b3c] text-[9px] font-semibold text-white"
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-white/55">4 users online</p>
            </div>
          </div>
        </div>

        {/* Device icons strip */}
        <div className="mt-4 flex items-center justify-center gap-6 text-white/70">
          <span className="flex flex-col items-center gap-1 text-[10px]">
            <Monitor className="h-5 w-5" /> Desktop
          </span>
          <span className="flex flex-col items-center gap-1 text-[10px]">
            <Tablet className="h-5 w-5" /> Tablet
          </span>
          <span className="flex flex-col items-center gap-1 text-[10px]">
            <Smartphone className="h-5 w-5" /> Mobile
          </span>
        </div>
      </div>
    </div>
  )
}

export function WebApplicationsHero({
  h1 = 'Web Applications',
  heroIntro,
}: {
  h1?: string
  heroIntro?: string
}) {
  const intro =
    heroIntro?.trim() ||
    'Whether you are replacing spreadsheets, streamlining business operations, creating a customer portal, supporting field teams, or bringing a new software product to market, XLS Experts designs and builds modern web applications that work anywhere, on any device, for multiple users—with one live source of data, cloud hosting and architecture shaped around your actual requirements.'
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
            { label: 'Web Applications' },
          ]}
        />
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">
              Services
            </p>
            <h1 className="font-display mb-4 text-4xl font-bold leading-tight text-white text-balance md:text-5xl">
              {h1}
            </h1>
            <p className="font-display mb-5 text-2xl font-semibold leading-snug text-white/95 text-balance md:text-3xl">
              Transform ideas into secure, cloud-based applications.
            </p>
            <p className="mb-8 text-base leading-relaxed text-white/80 md:text-lg">
              {intro}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#consultation"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Discuss Your Application
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#examples"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore Application Examples
              </a>
            </div>
          </div>
          <DeviceComposition />
        </div>
      </div>
    </section>
  )
}

export function CapabilityStrip() {
  return (
    <section className="border-b border-gray-200 bg-white py-8" aria-label="Capabilities">
      <div className="mx-auto max-w-5xl px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {webAppCapabilities.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm font-medium text-gray-800"
            >
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
          {' '}or{' '}
          <Link href="/enterprise" className="font-medium text-[#1a6b3c] hover:underline">
            enterprise Excel applications
          </Link>
          ?
        </p>
      </div>
    </section>
  )
}
