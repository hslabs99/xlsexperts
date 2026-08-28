import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ProcessSteps } from '@/components/solutions/process-steps'
import { PathwayDiagram } from '@/components/solutions/pathway-diagram'
import { SolutionCTA } from '@/components/solutions/solution-cta'
import { marketPageMetadata, marketSiteOrigin } from '@/lib/seo'
import {
  ALL_SOLUTIONS_HREF,
  solutionIcons,
  solutionPages,
} from '@/lib/solutions'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: ALL_SOLUTIONS_HREF,
    title: 'Business Systems Solutions NZ',
    description:
      'Business systems built around the way you work — dashboards, resource planning, financial modelling, manufacturing costing, property development, asset maintenance operations, quoting, field apps, portals and workflow automation for New Zealand organisations.',
    ogTitle: 'Business Systems Solutions | XLS Experts',
    ogDescription:
      'Practical business systems that may combine Excel, Microsoft 365, cloud applications, databases and integrations.',
  })
}

const indexApproachSteps = [
  {
    title: 'Understand the current process',
    description:
      'We map how work happens today — people, data, tools and the points where things slow down or break.',
  },
  {
    title: 'Identify the right level of modernisation',
    description:
      'Improve the spreadsheet, automate a hand-off, introduce a database, or build a full application — whichever fits.',
  },
  {
    title: 'Build and test the solution',
    description:
      'Working software early, refined with real users, validated against the edge cases that matter.',
  },
  {
    title: 'Support implementation and ongoing improvement',
    description:
      'Training, documentation and a clear path for enhancements as the business changes.',
  },
]

const pathwayItems = [
  'Improving an existing workbook',
  'Combining Excel with SharePoint or Microsoft 365',
  'Introducing a database',
  'Adding a web interface',
  'Integrating multiple business platforms',
  'Replacing the spreadsheet entirely',
]

export default async function SolutionsIndexPage() {
  const origin = await marketSiteOrigin()
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'XLS Experts Solutions',
    itemListElement: solutionPages.map((solution, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: solution.title,
      url: `${origin}${solution.href}`,
      description: solution.summary,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Solutions',
        item: `${origin}${ALL_SOLUTIONS_HREF}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="pt-16">
        <section
          className="relative overflow-hidden py-20 sm:py-24"
          style={{
            background:
              'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
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
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Solutions
            </span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white text-balance md:text-5xl lg:text-6xl">
              Business systems built around the way you work
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              XLS Experts helps organisations improve, automate and replace
              spreadsheet-driven business processes with practical systems that
              may combine Excel, Microsoft 365, cloud applications, databases
              and integrations.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#solutions"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50"
              >
                Explore our solutions <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Discuss your project
              </a>
            </div>
          </div>
        </section>

        <section id="solutions" className="scroll-mt-20 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#1a6b3c' }}
              >
                What we build
              </span>
              <h2 className="font-display mt-3 text-3xl font-bold text-gray-900">
                Choose the type of system you need
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                Many client engagements still begin with Excel. From there we can
                improve a workbook, automate a process, connect systems, migrate
                into Microsoft 365, or build database-backed cloud applications
                and custom operational software.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {solutionPages.map((solution) => {
                const Icon = solutionIcons[solution.icon]
                return (
                  <article
                    key={solution.slug}
                    className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center"
                        style={{ backgroundColor: '#e8f5ee' }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: '#1a6b3c' }}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-gray-900">
                          {solution.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {solution.summary}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-2 border-t border-gray-100 pt-5">
                      {solution.exampleUses.map((use) => (
                        <li
                          key={use}
                          className="flex gap-2 text-sm text-gray-600"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]"
                            aria-hidden="true"
                          />
                          {use}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={solution.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1a6b3c] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
                    >
                      Explore {solution.shortTitle}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-gray-900">
                A system does not need to start from scratch
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                XLS Experts can work with the systems a client already has. The
                right solution depends on the process, the people who use it, and
                how far the current tools can reasonably go.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pathwayItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <PathwayDiagram />
          </div>
        </section>

        <ProcessSteps
          heading="How we approach business systems"
          steps={indexApproachSteps}
        />

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              Not sure which solution fits?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Many projects cross more than one category. A quoting system may
              also need workflow automation. A financial model may need a
              dashboard. A resource planner may evolve into a staff portal.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Tell us about the current process and the outcome you want — you
              do not need to choose the technology first.
            </p>
            <a
              href="#contact"
              className="btn-primary mt-8 inline-flex h-11 items-center rounded-lg px-7 text-sm font-semibold"
            >
              Discuss your project
            </a>
          </div>
        </section>

        <SolutionCTA
          heading="Ready to talk through your process?"
          body="Describe what is not working today, who uses it, and what a better system would achieve. We will recommend a practical next step."
          href="#contact"
        />
        <Contact />
      </main>
    </>
  )
}
