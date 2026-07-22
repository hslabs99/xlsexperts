import { ArrowRight } from 'lucide-react'

type SolutionCTAProps = {
  heading: string
  body: string
  href: string
  label?: string
}

export function SolutionCTA({
  heading,
  body,
  href,
  label = 'Discuss your project',
}: SolutionCTAProps) {
  return (
    <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
      <div className="mx-auto max-w-xl px-6">
        <h2 className="font-display mb-4 text-3xl font-bold text-white">
          {heading}
        </h2>
        <p className="mb-8 text-white/80">{body}</p>
        <a
          href={href}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
