import { NextResponse } from 'next/server'
import {
  deleteServicePageTile,
  fetchAllServicePageTiles,
  upsertServicePageTile,
} from '@/lib/service-page-tiles-db'
import type { ServicePageTileInput } from '@/lib/service-page-tiles-shared'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const items = await withTimeout(
      fetchAllServicePageTiles(),
      15_000,
      'fetchAllServicePageTiles'
    )
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load service page tiles',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ServicePageTileInput
    if (!body.title?.trim() || !body.detail?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'title and detail are required' },
        { status: 400 }
      )
    }
    const slug = await withTimeout(
      upsertServicePageTile(body),
      12_000,
      'upsertServicePageTile'
    )
    return NextResponse.json({ ok: true, slug })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save tile',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as ServicePageTileInput & {
      slug?: string
    }
    if (!body.slug?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'slug is required' },
        { status: 400 }
      )
    }
    const slug = await withTimeout(
      upsertServicePageTile(body),
      12_000,
      'upsertServicePageTile'
    )
    return NextResponse.json({ ok: true, slug })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update tile',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')?.trim()
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'slug is required' },
        { status: 400 }
      )
    }
    await withTimeout(deleteServicePageTile(slug), 8_000, 'deleteServicePageTile')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete tile',
      },
      { status: 500 }
    )
  }
}
