import { NextResponse } from 'next/server'
import {
  deleteBlogPost,
  fetchAllBlogPostRecords,
  saveBlogPost,
  toPublicBlogPost,
  updateBlogPostFields,
  type BlogPostInput,
  type BlogPostRecord,
} from '@/lib/blog-db'
import { withTimeout } from '@/lib/with-timeout'

function serializeTimestamp(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return null
}

function serializeBlog(record: BlogPostRecord) {
  return {
    ...toPublicBlogPost(record),
    published: record.published,
    featured: record.featured,
    sortOrder: record.sortOrder,
    createdAt: serializeTimestamp(record.createdAt),
    updatedAt: serializeTimestamp(record.updatedAt),
  }
}

export async function GET() {
  try {
    const rows = await withTimeout(
      fetchAllBlogPostRecords(),
      12_000,
      'fetchAllBlogPostRecords'
    )
    return NextResponse.json({
      ok: true,
      items: rows.map(serializeBlog),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load blogs',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BlogPostInput
    await withTimeout(saveBlogPost(body), 12_000, 'saveBlogPost')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save blog',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<BlogPostInput> & {
      slug?: string
    }
    const slug = body.slug?.trim()
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'slug is required' },
        { status: 400 }
      )
    }
    const { slug: _slug, ...fields } = body
    await withTimeout(
      updateBlogPostFields(slug, fields),
      8_000,
      'updateBlogPostFields'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update blog',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')?.trim()
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'slug is required' },
        { status: 400 }
      )
    }
    await withTimeout(deleteBlogPost(slug), 8_000, 'deleteBlogPost')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog',
      },
      { status: 500 }
    )
  }
}
