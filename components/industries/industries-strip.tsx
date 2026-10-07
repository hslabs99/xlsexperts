import Link from 'next/link'
import { industryIcons } from '@/components/industries/industry-icons'
import { ALL_INDUSTRIES_HREF, industryPages } from '@/lib/industries'

/** Compact industry links under the homepage services block. */
export function IndustriesStrip() {
  return (
    <section className="bg-white py-14 sm:py-16" aria-label="Industries">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#1a6b3c' }}
          >
            Industries
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Excel and automation by industry
          </h2>
        </div>
        <ul className="mt-10 flex flex-wrap items-stretch justify-center gap-3">
          {industryPages.map((industry) => {
            const Icon = industryIcons[industry.icon]
            return (
              <li key={industry.href}>
                <Link
                  href={industry.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:border-[#1a6b3c] hover:text-[#1a6b3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {industry.navLabel}
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="mt-8 text-center">
          <Link
            href={ALL_INDUSTRIES_HREF}
            className="text-sm font-bold uppercase tracking-widest hover:underline"
            style={{ color: '#1a6b3c' }}
          >
            All industries
          </Link>
        </p>
      </div>
    </section>
  )
}
