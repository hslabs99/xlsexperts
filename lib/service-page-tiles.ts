import 'server-only'

import {
  selectTilesForServicePage,
  type ServicePageTile,
} from '@/lib/service-page-tiles-shared'
import { SERVICE_PAGE_TILES_ARCHIVE } from '@/lib/service-page-tiles-archive'

/**
 * Public tiles for one service landing page.
 * Prefers Firestore CMS; falls back to the frozen archive when empty/unavailable.
 * Never used on the homepage.
 */
export async function getServicePageTiles(
  serviceHref: string
): Promise<ServicePageTile[]> {
  const href = serviceHref.startsWith('/') ? serviceHref : `/${serviceHref}`
  try {
    const { fetchAllServicePageTiles } = await import(
      '@/lib/service-page-tiles-db'
    )
    const rows = await fetchAllServicePageTiles()
    const fromCms = selectTilesForServicePage(rows, href)
    if (fromCms.length > 0) return fromCms
  } catch (err) {
    console.error('[service-page-tiles] CMS read failed, using archive', err)
  }

  return selectTilesForServicePage(
    SERVICE_PAGE_TILES_ARCHIVE.map((item) => ({
      ...item,
      published: true,
    })),
    href
  )
}
