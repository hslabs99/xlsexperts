type SolutionIntroProps = {
  heading: string
  body: string[]
}

export function SolutionIntro({ heading, body }: SolutionIntroProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display mb-6 text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        <div className="space-y-4">
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-base leading-relaxed text-gray-600">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
