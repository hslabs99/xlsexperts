import { CaseStudies } from '@/components/case-studies'
import { getHomeCaseStudies } from '@/lib/case-studies'
import { fetchMoreCaseStudies } from '@/lib/case-studies-db'

/**
 * Server wrapper: loads the pre-rendered homepage snapshot (one Firestore read)
 * and passes cards into the client section. “More” loads over the network only
 * when the visitor asks for it.
 */
export async function CaseStudiesSection() {
  const initialItems = await getHomeCaseStudies()
  const excludeSlugs = initialItems.map((item) => item.slug).filter(Boolean)
  // Probe whether anything remains (Firestore or archive fallback) beyond first paint.
  const { items: peek } = await fetchMoreCaseStudies({
    excludeSlugs,
    limit: 1,
  })
  return (
    <CaseStudies
      initialItems={initialItems}
      initialHasMore={peek.length > 0}
    />
  )
}
