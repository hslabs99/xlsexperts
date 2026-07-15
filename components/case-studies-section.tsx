import { CaseStudies } from '@/components/case-studies'
import { getHomeCaseStudies } from '@/lib/case-studies'

/**
 * Server wrapper: loads the pre-rendered homepage snapshot (one Firestore read)
 * and passes cards into the client section. “More” loads over the network only
 * when the visitor asks for it.
 */
export async function CaseStudiesSection() {
  const initialItems = await getHomeCaseStudies()
  return (
    <CaseStudies
      initialItems={initialItems}
      initialHasMore={initialItems.length >= 4}
    />
  )
}
