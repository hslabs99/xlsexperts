import { NextResponse } from 'next/server'
import { buildCmsRegionHealthReport } from '@/lib/cms-region-health'
import { fetchPageSeoDraft } from '@/lib/page-seo-db'
import { fetchMarketCopyDraft } from '@/lib/market-copy-db'
import { fetchHomeServicesDraft } from '@/lib/home-services-db'
import { fetchHeroTopBulletsDraft } from '@/lib/hero-top-bullets-db'
import { withTimeout } from '@/lib/with-timeout'

async function loadOrError<T>(
  label: string,
  loader: () => Promise<T>
): Promise<{ value: T | null; error?: string }> {
  try {
    return { value: await withTimeout(loader(), 8_000, label) }
  } catch (error) {
    return {
      value: null,
      error: `${label}: ${error instanceof Error ? error.message : 'failed'}`,
    }
  }
}

export async function GET() {
  try {
    const [pageSeo, marketCopy, homeServices, topBullets] = await Promise.all([
      loadOrError('Pages CMS', fetchPageSeoDraft),
      loadOrError('Site CMS', fetchMarketCopyDraft),
      loadOrError('Home services', fetchHomeServicesDraft),
      loadOrError('Top Bullets', fetchHeroTopBulletsDraft),
    ])

    const errors = [pageSeo, marketCopy, homeServices, topBullets]
      .map((item) => item.error)
      .filter((message): message is string => Boolean(message))

    const report = buildCmsRegionHealthReport({
      pageSeo: pageSeo.value?.markets ?? null,
      marketCopy: marketCopy.value?.markets ?? null,
      homeServices: homeServices.value?.content ?? null,
      topBullets: topBullets.value?.content ?? null,
      errors,
    })

    return NextResponse.json({ ok: true, ...report })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    )
  }
}
