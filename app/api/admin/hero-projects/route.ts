import { NextResponse } from 'next/server'
import {
  fetchHeroProjectsDraft,
  publishHeroProjects,
  saveHeroProjectsDraft,
} from '@/lib/hero-projects-db'
import {
  normalizeHeroProjects,
  type HeroProjectTile,
} from '@/lib/hero-trust'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchHeroProjectsDraft(),
      8_000,
      'fetchHeroProjectsDraft'
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
      projects?: HeroProjectTile[]
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'

    if (action === 'publish') {
      const projects =
        body.projects != null
          ? normalizeHeroProjects({ projects: body.projects })
          : undefined
      const result = await withTimeout(
        publishHeroProjects(projects),
        15_000,
        'publishHeroProjects'
      )
      return NextResponse.json({
        ok: true,
        projects: result.projects,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        message:
          'Published to static file. The public homepage imports this file — no database read.',
      })
    }

    if (!body.projects) {
      return NextResponse.json(
        { ok: false, error: 'projects payload required' },
        { status: 400 }
      )
    }

    const projects = await withTimeout(
      saveHeroProjectsDraft(normalizeHeroProjects({ projects: body.projects })),
      8_000,
      'saveHeroProjectsDraft'
    )
    return NextResponse.json({
      ok: true,
      projects,
      message:
        'Draft saved to Firebase (Site Content / hero-projects). Click Publish to update the static file used by the public site.',
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
