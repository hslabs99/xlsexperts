import Link from 'next/link'
import { IndustrySectorTag } from '@/components/industries/industry-sector-tag'
import { caseStudiesMatchingHref, caseStudyPath } from '@/lib/case-studies-pages'
import { getMarket } from '@/lib/market-server'
import { regionalizePublicCopy } from '@/lib/page-seo-faqs'

/** “Related case study” block for a service or solution page. */
export async function MatchingCaseStudies({ href }: { href: string }) {
  const market = await getMarket()
  const say = (text: string) => regionalizePublicCopy(text, market)
  const studies = caseStudiesMatchingHref(href)
  if (studies.length === 0) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
          Related case study
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <article
              key={study.slug}
              className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6"
            >
              <IndustrySectorTag sector={study.sector} label={say(study.sector)} />
              <h3 className="font-display mt-2 text-base font-bold text-gray-900">
                {say(study.title)}
              </h3>
              {study.client ? (
                <p className="mt-1 text-sm text-gray-500">{study.client}</p>
              ) : null}
              {study.outcome ? (
                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                  {say(study.outcome)}
                </p>
              ) : null}
              <Link
                href={caseStudyPath(study.slug)}
                className="mt-5 text-sm font-semibold text-[#1a6b3c] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
              >
                Read case study →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
