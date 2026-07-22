type TechnologyStripProps = {
  heading: string
  notes: string[]
  technologies: string[]
}

export function TechnologyStrip({
  heading,
  notes,
  technologies,
}: TechnologyStripProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-6 text-center text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center">
          {notes.map((note) => (
            <p key={note.slice(0, 40)} className="text-base leading-relaxed text-gray-600">
              {note}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
