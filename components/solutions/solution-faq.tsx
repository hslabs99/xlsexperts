import type { SolutionFaq } from '@/lib/solutions'

type SolutionFAQProps = {
  faqs: SolutionFaq[]
}

export function SolutionFAQ({ faqs }: SolutionFAQProps) {
  if (faqs.length === 0) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-gray-200 p-6"
            >
              <h3 className="font-display mb-2 font-bold text-gray-900">
                {faq.question}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function solutionFaqJsonLd(faqs: SolutionFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
