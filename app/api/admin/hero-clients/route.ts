import { NextResponse } from 'next/server'
import {
  fetchHeroClientsDraft,
  publishHeroClients,
  saveHeroClientsDraft,
} from '@/lib/hero-clients-db'
import {
  normalizeHeroClientFade,
  normalizeHeroClientHeading,
  normalizeHeroClients,
  type HeroClientFade,
  type HeroClientTile,
} from '@/lib/hero-trust'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchHeroClientsDraft(),
      8_000,
      'fetchHeroClientsDraft'
    )
    return NextResponse.json({
      ok: true,
      ...draft,
      count: draft.clients.length,
    })
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
      clients?: HeroClientTile[]
      fade?: HeroClientFade
      heading?: string
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'
    const fade =
      body.fade != null ? normalizeHeroClientFade(body.fade) : undefined
    const heading =
      typeof body.heading === 'string'
        ? normalizeHeroClientHeading({ heading: body.heading })
        : undefined

    if (action === 'publish') {
      const clients =
        body.clients != null
          ? normalizeHeroClients({ clients: body.clients })
          : undefined
      const result = await withTimeout(
        publishHeroClients(clients, fade, heading),
        30_000,
        'publishHeroClients'
      )
      return NextResponse.json({
        ok: true,
        clients: result.clients,
        fade: result.fade,
        heading: result.heading,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        count: result.clients.length,
        message: `Published ${result.clients.length} logos. The homepage shows them 12 at a time in this shuffled order.`,
      })
    }

    if (!body.clients) {
      return NextResponse.json(
        { ok: false, error: 'clients payload required' },
        { status: 400 }
      )
    }

    const saved = await withTimeout(
      saveHeroClientsDraft(
        normalizeHeroClients({ clients: body.clients }),
        fade,
        heading
      ),
      8_000,
      'saveHeroClientsDraft'
    )
    return NextResponse.json({
      ok: true,
      clients: saved.clients,
      fade: saved.fade,
      heading: saved.heading,
      message:
        'Draft saved to Firebase (Site Content / hero-clients). Click Publish to update the static file used by the public site.',
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
