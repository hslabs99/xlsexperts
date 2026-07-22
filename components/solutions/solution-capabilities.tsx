type SolutionCapabilitiesProps = {
  heading: string
  capabilities: string[]
}

export function SolutionCapabilities({
  heading,
  capabilities,
}: SolutionCapabilitiesProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-10 text-center text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
          {capabilities.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
