import { NextResponse } from 'next/server'
import {
  deleteBlogSeedTodo,
  listBlogSeedTodos,
  resetBlogSeedTodoStatus,
  syncBlogSeedTodosFromConstant,
  updateBlogSeedTodo,
} from '@/lib/blog-seed-todo-db'
import type { BlogSeedTodoStatus } from '@/lib/blog-seed-todo-shared'
import { getWixBlogSeedEntries } from '@/lib/wix-blog-seed-urls'

/**
 * GET — list harvest queue (`blog_seed_todo`)
 * POST — { action: 'sync' | 'reset', slugs?: string[] }
 * PATCH — update one row
 * DELETE — ?slug=
 */
export async function GET() {
  try {
    const items = await listBlogSeedTodos()
    const constantCount = getWixBlogSeedEntries().length
    return NextResponse.json({
      ok: true,
      items,
      constantCount,
      collectionCount: items.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to list',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: string
      slugs?: string[]
      status?: BlogSeedTodoStatus
    }
    const action = body.action || 'sync'

    if (action === 'sync') {
      const result = await syncBlogSeedTodosFromConstant()
      const items = await listBlogSeedTodos()
      return NextResponse.json({ ok: true, ...result, items })
    }

    if (action === 'reset') {
      const slugs = Array.isArray(body.slugs) ? body.slugs : []
      if (!slugs.length) {
        return NextResponse.json(
          { ok: false, error: 'slugs required for reset' },
          { status: 400 }
        )
      }
      const status = body.status || 'pending'
      const reset = await resetBlogSeedTodoStatus(slugs, status)
      const items = await listBlogSeedTodos()
      return NextResponse.json({ ok: true, reset, items })
    }

    return NextResponse.json(
      { ok: false, error: `Unknown action: ${action}` },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string
      status?: BlogSeedTodoStatus
      title?: string
      category?: string
      lastError?: string | null
    }
    if (!body.slug) {
      return NextResponse.json(
        { ok: false, error: 'slug required' },
        { status: 400 }
      )
    }
    await updateBlogSeedTodo(body.slug, {
      status: body.status,
      title: body.title,
      category: body.category,
      lastError: body.lastError,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug')
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'slug required' },
        { status: 400 }
      )
    }
    await deleteBlogSeedTodo(slug)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete',
      },
      { status: 500 }
    )
  }
}
