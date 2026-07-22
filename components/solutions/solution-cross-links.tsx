import Link from 'next/link'

type SolutionCrossLink = {
  href: string
  label: string
}

/** Compact cross-link band from service pages into the Solutions section. */
export function SolutionCrossLinks({
  heading = 'Related business systems',
  links,
}: {
  heading?: string
  links: SolutionCrossLink[]
}) {
  if (links.length === 0) return null

  return (
    <section className="border-y border-[#c5e0d0] bg-[#e8f5ee]/50 py-12">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-display text-xl font-bold text-gray-900">{heading}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
          Looking at the broader process, not only the Excel skill? Explore how
          this work fits into our business systems solutions.
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex rounded-lg border border-[#1a6b3c]/30 bg-white px-4 py-2 text-sm font-semibold text-[#1a6b3c] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/solutions"
              className="inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 underline-offset-2 hover:underline"
            >
              All solutions
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
