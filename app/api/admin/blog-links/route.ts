import { NextResponse } from 'next/server'
import {
  fetchBlogLinkGraph,
  saveBlogLinkGraph,
} from '@/lib/blog-links-db'
import { normalizeBlogLinkGraph, type BlogLinkGraph } from '@/lib/blog-links'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const graph = await withTimeout(
      fetchBlogLinkGraph(),
      8_000,
      'fetchBlogLinkGraph'
    )
    return NextResponse.json({ ok: true, graph })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load links',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as BlogLinkGraph
    const graph = normalizeBlogLinkGraph(body)
    const saved = await withTimeout(
      saveBlogLinkGraph(graph),
      8_000,
      'saveBlogLinkGraph'
    )
    return NextResponse.json({ ok: true, graph: saved })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save links',
      },
      { status: 500 }
    )
  }
}
