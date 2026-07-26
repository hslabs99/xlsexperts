import type { Metadata } from 'next'
import { marketPageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { serviceIcons } from '@/components/service-icons'
import { servicePages } from '@/lib/service-pages'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/services',
    title: 'All Services | Excel & Business Automation NZ | XLS Experts',
    description: 'Browse all XLS Experts services — Excel VBA, dashboards, financial modelling, Power Query, Google Sheets, AI workflow automation and more for New Zealand businesses.',
    ogTitle: 'All Services | XLS Experts',
    ogDescription: 'Excel, spreadsheet and business automation services for New Zealand organisations.',
  })
}

export default function AllServicesPage() {
  return (
    <main>
      <Navbar />
      <section className="bg-white pt-16">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:px-8 lg:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#1a6b3c' }}
            >
              What we do
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              All services
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-500">
              {servicePages.length} specialised services covering Excel, Google
              Sheets, data integration, web applications and AI-powered
              workflow automation. Click a tile to learn more.
            </p>
          </div>

          <div className="mt-14 grid border-l border-t border-[#c5e0d0] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {servicePages.map((service) => {
              const Icon = serviceIcons[service.icon]
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group flex flex-col gap-4 border-b border-r border-[#c5e0d0] bg-white p-7 transition-colors hover:bg-gray-50"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center"
                    style={{ backgroundColor: '#e8f5ee' }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: '#1a6b3c' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold text-gray-900 group-hover:underline">
                      {service.label}
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-500">
                      {service.description}
                    </p>
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
            })}
          </div>

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
      <Contact />
    </main>
  )
}
