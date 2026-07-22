import Link from 'next/link'
import { solutionIcons, type SolutionPage } from '@/lib/solutions'

type RelatedSolutionsProps = {
  solutions: SolutionPage[]
  linkLabels: Record<string, string>
}

export function RelatedSolutions({
  solutions,
  linkLabels,
}: RelatedSolutionsProps) {
  if (solutions.length === 0) return null

  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
          Related solutions
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Many projects combine more than one capability.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solutionIcons[solution.icon]
            const label =
              linkLabels[solution.slug] ?? `Explore ${solution.shortTitle}`
            return (
              <Link
                key={solution.slug}
                href={solution.href}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#1a6b3c]/40 hover:bg-[#e8f5ee]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center"
                  style={{ backgroundColor: '#e8f5ee' }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: '#1a6b3c' }}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display text-base font-bold text-gray-900 group-hover:underline">
                  {solution.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-[#1a6b3c]">{label}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
