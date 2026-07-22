type SystemApproachProps = {
  heading: string
  body: string[]
}

/** Optional mid-page narrative for pathway / architecture messaging. */
export function SystemApproach({ heading, body }: SystemApproachProps) {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
          {heading}
        </h2>
        <div className="space-y-4">
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-gray-600">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
