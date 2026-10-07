import { notFound, permanentRedirect } from 'next/navigation'
import { headers } from 'next/headers'
import {
  contextFromHeaderBag,
  resolveIncomingPath,
} from '@/lib/blog-incoming'

export const dynamic = 'force-dynamic'

/**
 * Old /post/{slug} URLs. The proxy 301s these in one hop when Firestore
 * is available. This page is the backup so they never land on the blog index.
 */
export default async function LegacyPostSlug({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const path = `/post/${slug}`
  let decision: Awaited<ReturnType<typeof resolveIncomingPath>> = {
    type: 'continue',
    missing: false,
  }
  try {
    decision = await resolveIncomingPath(
      contextFromHeaderBag(await headers(), path)
    )
  } catch (error) {
    console.error('Legacy post routing failed', error)
  }
  if (decision.type === 'redirect') permanentRedirect(decision.url)
  notFound()
}
