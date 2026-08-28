import { CheckCircle } from 'lucide-react'
import { renderBlogInline } from '@/lib/blog-inline-markup'
import type { SolutionDeepSection, SolutionFeatureGrid, SolutionWhyUs } from '@/lib/solutions'

type SolutionDeepContentProps = {
  sections: readonly SolutionDeepSection[]
  featureGrid?: SolutionFeatureGrid
  whyUs?: SolutionWhyUs
}

export function SolutionDeepContent({
  sections,
  featureGrid,
  whyUs,
}: SolutionDeepContentProps) {
  return (
    <>
      {sections.map((section, index) => {
        const alt = index % 2 === 1
        return (
          <section
            key={section.id}
            id={section.id}
            className={alt ? 'bg-gray-50 py-16 sm:py-20' : 'bg-white py-16 sm:py-20'}
          >
            <div className="mx-auto max-w-5xl px-6">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display mb-4 text-3xl font-bold text-gray-900">
                  {section.heading}
                </h2>
                {section.intro && (
                  <p className="mb-6 text-base leading-relaxed text-gray-600">
                    {renderBlogInline(section.intro)}
                  </p>
                )}
                {section.body?.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mb-4 text-base leading-relaxed text-gray-600"
                  >
                    {renderBlogInline(paragraph)}
                  </p>
                ))}
                {section.callout && (
                  <blockquote className="mt-6 border-l-4 border-[#1a6b3c] bg-[#e8f5ee]/60 px-5 py-4">
                    <p className="text-base font-medium leading-relaxed text-gray-800">
                      {renderBlogInline(section.callout)}
                    </p>
                  </blockquote>
                )}
              </div>

              {section.items && section.items.length > 0 && (
                <ul
                  className={`mt-8 grid gap-3 ${
                    section.items.length > 10
                      ? 'sm:grid-cols-2 lg:grid-cols-3'
                      : 'sm:grid-cols-2'
                  }`}
                >
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700"
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

              {section.cards && section.cards.length > 0 && (
                <div
                  className={`mt-10 grid gap-6 ${
                    section.cardColumns === 3
                      ? 'md:grid-cols-3'
                      : 'md:grid-cols-2'
                  }`}
                >
                  {section.cards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
                    >
                      <h3 className="font-display mb-3 text-lg font-bold text-gray-900">
                        {card.title}
                      </h3>
                      {card.description && (
                        <p className="mb-4 text-sm leading-relaxed text-gray-600">
                          {renderBlogInline(card.description)}
                        </p>
                      )}
                      {card.items && card.items.length > 0 && (
                        <ul className="space-y-2">
                          {card.items.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2 text-sm text-gray-600"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.layers && section.layers.length > 0 && (
                <ol className="mt-10 space-y-4">
                  {section.layers.map((layer, layerIndex) => (
                    <li
                      key={layer.title}
                      className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: '#1a6b3c' }}
                      >
                        {layerIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-display mb-2 text-lg font-bold text-gray-900">
                          {layer.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {layer.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        )
      })}

      {featureGrid && (
        <section id="features" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              {featureGrid.heading}
            </h2>
            {featureGrid.intro && (
              <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
                {featureGrid.intro}
              </p>
            )}
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featureGrid.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {whyUs && (
        <section id="why-xls-experts" className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-6 text-3xl font-bold text-gray-900">
              {whyUs.heading}
            </h2>
            <div className="space-y-4">
              {whyUs.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-base leading-relaxed text-gray-600"
                >
                  {renderBlogInline(paragraph)}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
