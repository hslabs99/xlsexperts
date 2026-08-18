import Link from 'next/link'
import { serviceIcons } from '@/components/service-icons'
import { getHomeServicesContent } from '@/lib/home-services-server'
import type { HomeServiceTile } from '@/lib/home-services'

function ServiceTile({ service }: { service: HomeServiceTile }) {
  const Icon = serviceIcons[service.icon] ?? serviceIcons.spreadsheet
  return (
    <Link
      href={service.href}
      className="group flex flex-col gap-4 bg-white p-7 transition-colors hover:bg-gray-50"
    >
      <div
        className="flex h-10 w-10 items-center justify-center"
        style={{ backgroundColor: '#e8f5ee' }}
      >
        <Icon className="h-5 w-5" style={{ color: '#1a6b3c' }} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-gray-900 group-hover:underline">
          {service.title}
        </h3>
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
    </Link>
  )
}

export async function Services() {
  const content = await getHomeServicesContent()

  return (
    <section id="services" className="py-20 sm:py-28" style={{ backgroundColor: '#e8f5ee' }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
            {content.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {content.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            {content.intro}
          </p>
        </div>

        {/* Service cards */}
        <div className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: '#c5e0d0' }}>
          {content.tiles.map((service) => (
            <ServiceTile key={service.href} service={service} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8">
          <Link
            href={content.viewAllHref}
            className="text-sm font-bold uppercase tracking-widest transition-colors hover:underline"
            style={{ color: '#1a6b3c' }}
          >
            {content.viewAllLabel}
          </Link>
          <Link
            href={content.useCasesHref}
            className="text-sm font-bold uppercase tracking-widest transition-colors hover:underline"
            style={{ color: '#1a6b3c' }}
          >
            {content.useCasesLabel}
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm text-gray-500">
            {content.ctaPrompt}
          </p>
          <a
            href={content.ctaHref}
            className="btn-primary inline-flex h-9 items-center rounded-sm px-5 text-sm font-medium"
          >
            {content.ctaLabel}
          </a>
        </div>

      </div>
    </section>
  )
}
