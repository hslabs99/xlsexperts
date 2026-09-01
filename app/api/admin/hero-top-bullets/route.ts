import { NextResponse } from 'next/server'
import {
  fetchHeroTopBulletsDraft,
  publishHeroTopBullets,
  saveHeroTopBulletsDraft,
} from '@/lib/hero-top-bullets-db'
import {
  normalizeHeroTopBulletsBundle,
  type HeroTopBulletsBundle,
} from '@/lib/hero-top-bullets'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchHeroTopBulletsDraft(),
      8_000,
      'fetchHeroTopBulletsDraft'
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
      content?: HeroTopBulletsBundle
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'

    if (action === 'publish') {
      const content =
        body.content != null
          ? normalizeHeroTopBulletsBundle(body.content)
          : undefined
      const result = await withTimeout(
        publishHeroTopBullets(content),
        15_000,
        'publishHeroTopBullets'
      )
      return NextResponse.json({
        ok: true,
        content: result.content,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        message:
          'Published to static file. The public homepage imports this file — no database read.',
      })
    }

    if (!body.content) {
      return NextResponse.json(
        { ok: false, error: 'content payload required' },
        { status: 400 }
      )
    }

    const content = await withTimeout(
      saveHeroTopBulletsDraft(normalizeHeroTopBulletsBundle(body.content)),
      8_000,
      'saveHeroTopBulletsDraft'
    )
    return NextResponse.json({
      ok: true,
      content,
      message:
        'Draft saved to Firebase (Site Content / hero-top-bullets). Click Publish to update the static file used by the public site.',
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
