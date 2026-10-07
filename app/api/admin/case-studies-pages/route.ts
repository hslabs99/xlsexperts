import { NextResponse } from 'next/server'
import {
  fetchCaseStudyPagesStatus,
  publishCaseStudyPages,
} from '@/lib/case-studies-pages-db'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const status = await withTimeout(
      fetchCaseStudyPagesStatus(),
      12_000,
      'fetchCaseStudyPagesStatus',
    )
    return NextResponse.json({ ok: true, ...status })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load',
      },
      { status: 500 },
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
        { status: 400 },
      )
    }

    const result = await withTimeout(
      publishCaseStudyPages(),
      20_000,
      'publishCaseStudyPages',
    )
    const count = result.pageCount
    return NextResponse.json({
      ok: true,
      pageCount: count,
      slugs: result.items.map((item) => item.slug),
      publishedAt: result.publishedAt,
      filePath: result.filePath,
      message: `Published ${count} case study page${count === 1 ? '' : 's'} to ${result.filePath}. Commit that file and deploy.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to publish',
      },
      { status: 500 },
    )
  }
}
