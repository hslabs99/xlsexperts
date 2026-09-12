import { Contact } from '@/components/contact'
import { RelatedReading } from '@/components/related-reading'

export async function PageContact({ topicHref }: { topicHref: string }) {
  return (
    <>
      <RelatedReading topicHref={topicHref} />
      <Contact />
    </>
  )
}
