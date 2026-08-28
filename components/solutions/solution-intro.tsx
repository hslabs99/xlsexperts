import { CheckCircle } from 'lucide-react'
import { renderBlogInline } from '@/lib/blog-inline-markup'

type SolutionIntroProps = {
  heading: string
  body: string[]
  items?: string[]
}

export function SolutionIntro({ heading, body, items }: SolutionIntroProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display mb-6 text-3xl font-bold text-gray-900">
            {heading}
          </h2>
          <div className="space-y-4">
            {body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-relaxed text-gray-600"
              >
                {renderBlogInline(paragraph)}
              </p>
            ))}
          </div>
        </div>
        {items && items.length > 0 && (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700"
              >
                <CheckCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
