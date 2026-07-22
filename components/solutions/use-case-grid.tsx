type UseCaseGridProps = {
  heading: string
  useCases: { title: string; description: string }[]
}

export function UseCaseGrid({ heading, useCases }: UseCaseGridProps) {
  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-10 text-center text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {useCases.map((useCase) => (
            <article
              key={useCase.title}
              className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
            >
              <h3 className="font-display mb-3 text-lg font-bold text-gray-900">
                {useCase.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {useCase.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
