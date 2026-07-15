import { NextResponse } from 'next/server'
import {
  fetchSiteTags,
  saveSiteTags,
} from '@/lib/site-tags-db'
import { normalizeSiteTags, type SiteTagsContent } from '@/lib/site-tags'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const tags = await withTimeout(fetchSiteTags(), 8_000, 'fetchSiteTags')
    return NextResponse.json({ ok: true, tags })
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
    const body = (await request.json()) as SiteTagsContent
    const tags = normalizeSiteTags(body)
    await withTimeout(saveSiteTags(tags), 8_000, 'saveSiteTags')
    return NextResponse.json({ ok: true, tags })
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
