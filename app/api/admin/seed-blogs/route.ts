import { NextResponse } from 'next/server'
import { seedBlogPostsFromV0Archive } from '@/lib/blog-seed'

/**
 * Seed Firestore `blogPosts` from the frozen v0 archive (`lib/blog-posts.ts`).
 * Does not delete or modify the archive / public blog images.
 *
 * Body: { overwrite?: boolean, uploadImages?: boolean }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      overwrite?: boolean
      uploadImages?: boolean
    }
    const result = await seedBlogPostsFromV0Archive({
      overwrite: Boolean(body.overwrite),
      uploadImages: Boolean(body.uploadImages),
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Seed failed',
      },
      { status: 500 }
    )
  }
}
