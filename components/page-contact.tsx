import { Contact } from '@/components/contact'
import { IndustriesForPage } from '@/components/industries/industries-for-page'
import { RelatedReading } from '@/components/related-reading'

export async function PageContact({
  topicHref,
  showIndustryLinks = true,
}: {
  topicHref: string
  showIndustryLinks?: boolean
}) {
  return (
    <>
      {showIndustryLinks ? <IndustriesForPage href={topicHref} /> : null}
      <RelatedReading topicHref={topicHref} />
      <Contact />
    </>
  )
}
