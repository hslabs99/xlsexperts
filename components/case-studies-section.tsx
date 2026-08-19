import { CaseStudies } from '@/components/case-studies'
import { getHomeCaseStudies } from '@/lib/case-studies'

/**
 * Server wrapper: loads published homepage cards from the generated file
 * (Firestore draft on localhost). “Show more” loads over the network only
 * when the visitor asks for it.
 */
export async function CaseStudiesSection() {
  const { items, hasMore } = await getHomeCaseStudies()
  return (
    <CaseStudies
      initialItems={items}
      initialHasMore={hasMore}
    />
  )
}
