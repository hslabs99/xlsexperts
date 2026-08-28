type ProcessStepsProps = {
  heading: string
  steps: { title: string; description: string }[]
}

export function ProcessSteps({ heading, steps }: ProcessStepsProps) {
  if (steps.length === 0) return null

  const gridClass =
    steps.length === 5
      ? 'md:grid-cols-2 lg:grid-cols-3'
      : steps.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-2 lg:grid-cols-4'

  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        <ol className={`grid gap-6 ${gridClass}`}>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: '#1a6b3c' }}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="font-display mb-3 text-base font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
