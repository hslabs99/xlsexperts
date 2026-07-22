import type { SolutionCaseStudyRef } from '@/lib/solutions'

type RelatedCaseStudiesProps = {
  studies: SolutionCaseStudyRef[]
}

export function RelatedCaseStudies({ studies }: RelatedCaseStudiesProps) {
  const published = studies.filter((s) => s.published)
  if (published.length === 0) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
          Related work
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Examples of similar systems we have delivered for New Zealand organisations.
        </p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {published.map((study) => (
            <article
              key={study.slug}
              className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6"
            >
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#1a6b3c' }}
              >
                {study.sector}
              </p>
              <h3 className="font-display mt-2 text-base font-bold text-gray-900">
                {study.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{study.client}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                {study.summary}
              </p>
              <a
                href="/#case-studies"
                className="mt-5 text-sm font-semibold text-[#1a6b3c] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
              >
                View case studies on our homepage
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
