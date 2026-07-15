import { NextResponse } from 'next/server'
import { seedCaseStudiesFromArchive } from '@/lib/case-studies-seed'

/**
 * Seed Firestore `caseStudies` from the frozen archive + publish home snapshot.
 *
 * Body: { overwrite?: boolean, uploadImages?: boolean, publishHome?: boolean }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      overwrite?: boolean
      uploadImages?: boolean
      publishHome?: boolean
    }
    const result = await seedCaseStudiesFromArchive({
      overwrite: Boolean(body.overwrite),
      uploadImages: Boolean(body.uploadImages),
      publishHome: body.publishHome !== false,
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[seed-case-studies]', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Seed failed',
      },
      { status: 500 }
    )
  }
}
