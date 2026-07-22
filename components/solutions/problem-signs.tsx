import { CheckCircle } from 'lucide-react'

type ProblemSignsProps = {
  heading: string
  problems: string[]
}

export function ProblemSigns({ heading, problems }: ProblemSignsProps) {
  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        <p className="mb-12 text-center text-gray-500">
          Signs the current process needs attention.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem}
              className="flex gap-3 rounded-xl border border-gray-200 bg-white p-5"
            >
              <CheckCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-gray-700">{problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
