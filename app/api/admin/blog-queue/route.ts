import { NextResponse } from 'next/server'
import {
  createBlogQueueItem,
  deleteBlogQueueItem,
  listBlogQueueItems,
  updateBlogQueueItem,
} from '@/lib/blog-queue-db'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const items = await withTimeout(
      listBlogQueueItems(),
      12_000,
      'listBlogQueueItems'
    )
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to load blog queue',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      subject?: string
      body?: string
    }
    const item = await withTimeout(
      createBlogQueueItem({
        subject: String(body.subject ?? ''),
        body: String(body.body ?? ''),
      }),
      8_000,
      'createBlogQueueItem'
    )
    return NextResponse.json({ ok: true, item })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to create queue item',
      },
      { status: 400 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string
      subject?: string
      body?: string
    }
    const id = String(body.id ?? '').trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    const item = await withTimeout(
      updateBlogQueueItem(id, {
        subject: String(body.subject ?? ''),
        body: String(body.body ?? ''),
      }),
      8_000,
      'updateBlogQueueItem'
    )
    return NextResponse.json({ ok: true, item })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to update queue item',
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    await withTimeout(deleteBlogQueueItem(id), 8_000, 'deleteBlogQueueItem')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete queue item',
      },
      { status: 500 }
    )
  }
}
