import { NextResponse } from 'next/server'
import { seedServicePageTilesFromArchive } from '@/lib/service-page-tiles-db'
import { withTimeout } from '@/lib/with-timeout'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      overwrite?: boolean
    }
    const result = await withTimeout(
      seedServicePageTilesFromArchive({ overwrite: body.overwrite === true }),
      60_000,
      'seedServicePageTilesFromArchive'
    )
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to seed service page tiles',
      },
      { status: 500 }
    )
  }
}
