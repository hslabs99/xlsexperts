import { NextResponse } from 'next/server'

/**
 * Harvest selected (or all) rows from `blog_seed_todo` into draft `blogPosts`.
 *
 * Body: { slugs?: string[], overwriteDrafts?: boolean }
 * Prefer passing an explicit `slugs` list while tuning the parser.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      slugs?: string[]
      overwriteDrafts?: boolean
    }

    if (Array.isArray(body.slugs) && body.slugs.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'No slugs provided. Select at least one row in the harvest queue, or omit slugs to run all.',
        },
        { status: 400 }
      )
    }

    const { seedMissingBlogs, summarizeHarvest } = await import(
      '@/lib/wix-blog-harvest'
    )

    const result = await seedMissingBlogs({
      slugs: Array.isArray(body.slugs) ? body.slugs : undefined,
      overwriteDrafts: Boolean(body.overwriteDrafts),
    })
    return NextResponse.json({
      ok: true,
      summary: summarizeHarvest(result),
      ...result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Harvest failed'
    const stack = error instanceof Error ? error.stack : undefined
    console.error('[seed-missing-blogs]', message, stack)
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint:
          'Check the Next.js terminal for the full stack. Common causes: Firebase Admin credentials, Storage rules, or a broken Wix URL (404).',
      },
      { status: 500 }
    )
  }
}
