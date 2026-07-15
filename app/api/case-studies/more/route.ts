import { NextResponse } from 'next/server'
import {
  MORE_CASE_STUDIES_PAGE_SIZE,
  fetchMoreCaseStudies,
} from '@/lib/case-studies-db'

/**
 * GET /api/case-studies/more?exclude=slug1,slug2&limit=4
 * Returns the next page of published case studies for the homepage “More” button.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeRaw = searchParams.get('exclude') ?? ''
    const excludeSlugs = excludeRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const limitParam = Number(searchParams.get('limit'))
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 12)
        : MORE_CASE_STUDIES_PAGE_SIZE

    const result = await fetchMoreCaseStudies({ excludeSlugs, limit })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load',
        items: [],
        hasMore: false,
      },
      { status: 500 }
    )
  }
}
