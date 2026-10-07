import { NextResponse } from 'next/server'
import {
  fetchRegionAliasesDraft,
  publishRegionAliases,
  saveRegionAliasesDraft,
} from '@/lib/region-aliases-db'
import {
  normalizeRegionAliases,
  type RegionAlias,
} from '@/lib/region-aliases'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchRegionAliasesDraft(),
      8_000,
      'fetchRegionAliasesDraft'
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
      aliases?: RegionAlias[]
      action?: 'save' | 'publish'
    }
    const action = body.action === 'publish' ? 'publish' : 'save'

    if (action === 'publish') {
      const aliases =
        body.aliases != null ? normalizeRegionAliases(body.aliases) : undefined
      const result = await withTimeout(
        publishRegionAliases(aliases),
        15_000,
        'publishRegionAliases'
      )
      return NextResponse.json({
        ok: true,
        aliases: result.aliases,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        message:
          'Published region aliases. UK and international pages now swap these words, including content loaded live from Firebase.',
      })
    }

    if (!body.aliases) {
      return NextResponse.json(
        { ok: false, error: 'aliases payload required' },
        { status: 400 }
      )
    }

    const aliases = await withTimeout(
      saveRegionAliasesDraft(normalizeRegionAliases(body.aliases)),
      8_000,
      'saveRegionAliasesDraft'
    )
    return NextResponse.json({
      ok: true,
      aliases,
      message:
        'Draft saved to Firebase (Site Content / region-aliases). Localhost previews it on Firebase content. Click Publish to update the live sites.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Save failed',
      },
      { status: 500 }
    )
  }
}
