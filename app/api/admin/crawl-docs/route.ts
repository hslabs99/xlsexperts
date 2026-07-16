import { NextResponse } from 'next/server'
import { fetchCrawlDocs, saveCrawlDocs } from '@/lib/crawl-docs-db'
import {
  normalizeCrawlDocs,
  validateCrawlDocs,
  type CrawlDocsContent,
} from '@/lib/crawl-docs'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const docs = await withTimeout(fetchCrawlDocs(), 8_000, 'fetchCrawlDocs')
    return NextResponse.json({ ok: true, docs })
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
    const body = (await request.json()) as CrawlDocsContent
    const docs = normalizeCrawlDocs(body)
    const validationError = validateCrawlDocs(docs)
    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 }
      )
    }
    await withTimeout(saveCrawlDocs(docs), 8_000, 'saveCrawlDocs')
    return NextResponse.json({ ok: true, docs })
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
