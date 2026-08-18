import { NextResponse } from 'next/server'
import {
  fetchDomainRegionsDraft,
  publishDomainRegions,
  saveDomainRegionsDraft,
} from '@/lib/domain-regions-db'
import {
  normalizeDomainRegions,
  type DomainRegionConfig,
} from '@/lib/domain-regions'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchDomainRegionsDraft(),
      8_000,
      'fetchDomainRegionsDraft'
    )
    return NextResponse.json({ ok: true, ...draft })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      regions?: DomainRegionConfig
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'

    if (action === 'publish') {
      const regions =
        body.regions != null ? normalizeDomainRegions(body.regions) : undefined
      const result = await withTimeout(
        publishDomainRegions(regions),
        15_000,
        'publishDomainRegions'
      )
      return NextResponse.json({
        ok: true,
        regions: result.regions,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        message:
          'Published domain bindings. Production hosts now resolve to these regions; canonical URLs were updated to match.',
      })
    }

    if (!body.regions) {
      return NextResponse.json(
        { ok: false, error: 'regions payload required' },
        { status: 400 }
      )
    }

    const regions = await withTimeout(
      saveDomainRegionsDraft(normalizeDomainRegions(body.regions)),
      8_000,
      'saveDomainRegionsDraft'
    )
    return NextResponse.json({
      ok: true,
      regions,
      message:
        'Draft saved to Firebase (Site Content / domain-regions). Click Publish to update live host routing.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save',
      },
      { status: 500 }
    )
  }
}
