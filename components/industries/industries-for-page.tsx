import Link from 'next/link'
import { industriesLinkingTo } from '@/lib/industries'

/** Reverse lookup: industries whose related services or solutions include this page. */
export function IndustriesForPage({ href }: { href: string }) {
  const industries = industriesLinkingTo(href)
  if (industries.length === 0) return null

  return (
    <section className="border-y border-[#c5e0d0] bg-white py-12">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-display text-xl font-bold text-gray-900">
          Industries we do this for
        </h2>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {industries.map((industry) => (
            <li key={industry.href}>
              <Link
                href={industry.href}
                className="inline-flex rounded-full border border-[#1a6b3c]/30 bg-[#e8f5ee] px-4 py-2 text-sm font-semibold text-[#1a6b3c] transition-colors hover:bg-[#d7efe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
              >
                {industry.navLabel}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/industries"
              className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-gray-700 underline-offset-2 hover:underline"
            >
              All industries
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
