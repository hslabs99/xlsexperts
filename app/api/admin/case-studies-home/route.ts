import { NextResponse } from 'next/server'
import {
  fetchHomeCaseStudiesDraft,
  publishHomeCaseStudiesSnapshot,
} from '@/lib/case-studies-home-db'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchHomeCaseStudiesDraft(),
      8_000,
      'fetchHomeCaseStudiesDraft'
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
    const body = (await request.json().catch(() => ({}))) as {
      action?: 'publish'
    }
    if (body.action !== 'publish') {
      return NextResponse.json(
        { ok: false, error: 'action must be publish' },
        { status: 400 }
      )
    }

    const result = await withTimeout(
      publishHomeCaseStudiesSnapshot(),
      15_000,
      'publishHomeCaseStudiesSnapshot'
    )
    return NextResponse.json({
      ok: true,
      items: result.items,
      slugs: result.slugs,
      publishedAt: result.publishedAt,
      filePath: result.filePath,
      message:
        'Published to static file. The public homepage imports this file — no database read on first paint.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to publish',
      },
      { status: 500 }
    )
  }
}
