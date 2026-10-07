import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { CaseStudySummaryCard } from '@/components/case-study-summary-card'
import { getCaseStudyCatalogue } from '@/lib/case-studies-pages'
import { getMarket, getMarketCopy } from '@/lib/market-server'
import { regionalizePublicCopy } from '@/lib/page-seo-faqs'
import { marketPageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/case-studies',
    title: 'Excel Case Studies',
    description:
      'Excel and spreadsheet case studies: maintenance scheduling, quoting, reporting, and automation delivered for operators across industries.',
  })
}

export default async function CaseStudiesIndexPage() {
  const market = await getMarket()
  const say = (text: string) => regionalizePublicCopy(text, market)
  const items = getCaseStudyCatalogue().items.map((cs) => ({
    ...cs,
    sector: say(cs.sector),
    title: say(cs.title),
    outcome: say(cs.outcome),
    problem: say(cs.problem),
    solution: say(cs.solution),
    tags: cs.tags.map((tag) => say(tag)),
  }))
  const copy = await getMarketCopy()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="py-16 sm:py-20" style={{ backgroundColor: '#e8f5ee' }}>
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Proof of work
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Case Studies
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                {copy.caseStudies.homeIntro}
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {items.map((cs, index) => (
                <CaseStudySummaryCard
                  key={cs.slug}
                  cs={cs}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
