import type { ServicePageTile } from '@/lib/service-page-tiles-shared'

type Props = {
  heading: string
  subheading?: string
  tiles: ServicePageTile[]
}

/**
 * Shared case-study style tile grid for service landing pages only.
 * Content comes from the Service Tiles CMS (with archive fallback).
 */
export function ServicePageExamples({ heading, subheading, tiles }: Props) {
  if (tiles.length === 0) return null

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
          {heading}
        </h2>
        {subheading ? (
          <p className="mb-12 text-center text-gray-500">{subheading}</p>
        ) : (
          <div className="mb-12" />
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {tiles.map((ex) => (
            <div
              key={ex.slug}
              className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
            >
              {ex.tag ? (
                <span className="mb-3 inline-block rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">
                  {ex.tag}
                </span>
              ) : null}
              <h3 className="font-display mb-2 text-lg font-bold text-gray-900">
                {ex.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{ex.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
