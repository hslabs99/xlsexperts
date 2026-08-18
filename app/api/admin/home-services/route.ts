import { NextResponse } from 'next/server'
import {
  fetchHomeServicesDraft,
  publishHomeServices,
  saveHomeServicesDraft,
} from '@/lib/home-services-db'
import {
  normalizeHomeServicesContent,
  type HomeServicesContent,
} from '@/lib/home-services'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchHomeServicesDraft(),
      8_000,
      'fetchHomeServicesDraft'
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
      content?: HomeServicesContent
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'

    if (action === 'publish') {
      const content =
        body.content != null
          ? normalizeHomeServicesContent(body.content)
          : undefined
      const result = await withTimeout(
        publishHomeServices(content),
        15_000,
        'publishHomeServices'
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
      saveHomeServicesDraft(normalizeHomeServicesContent(body.content)),
      8_000,
      'saveHomeServicesDraft'
    )
    return NextResponse.json({
      ok: true,
      content,
      message:
        'Draft saved to Firebase (Site Content / home-services). Click Publish to update the static file used by the public site.',
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
