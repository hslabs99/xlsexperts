import { NextResponse } from 'next/server'
import {
  deleteCaseStudy,
  fetchAllCaseStudyRecords,
  publishHomeCaseStudiesSnapshot,
  saveCaseStudy,
  toPublicCaseStudy,
  updateCaseStudyFields,
  type CaseStudyInput,
  type CaseStudyRecord,
} from '@/lib/case-studies-db'
import { uploadCaseStudyImageAdmin } from '@/lib/case-studies-storage-admin'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'

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

function serializeCaseStudy(record: CaseStudyRecord) {
  return {
    ...toPublicCaseStudy(record),
    published: record.published,
    showOnHome: record.showOnHome,
    homeOrder: record.homeOrder,
    sortOrder: record.sortOrder,
    createdAt: serializeTimestamp(record.createdAt),
    updatedAt: serializeTimestamp(record.updatedAt),
  }
}

export async function GET() {
  try {
    const rows = await withTimeout(
      fetchAllCaseStudyRecords(),
      12_000,
      'fetchAllCaseStudyRecords'
    )
    return NextResponse.json({
      ok: true,
      items: rows.map(serializeCaseStudy),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to load case studies',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    let body: CaseStudyInput
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const payload = formData.get('payload')
      if (typeof payload !== 'string') {
        return NextResponse.json(
          { ok: false, error: 'Case study payload is required' },
          { status: 400 }
        )
      }
      body = JSON.parse(payload) as CaseStudyInput

      const image = formData.get('image')
      if (image && typeof image !== 'string') {
        body.image = await withTimeout(
          uploadCaseStudyImageAdmin(body.slug, image),
          20_000,
          'uploadCaseStudyImageAdmin'
        )
      }
    } else {
      body = (await request.json()) as CaseStudyInput
    }

    await withTimeout(saveCaseStudy(body), 12_000, 'saveCaseStudy')
    return NextResponse.json({ ok: true, image: body.image })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to save case study',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<CaseStudyInput> & {
      slug?: string
      action?: string
    }

    if (body.action === 'publish-home') {
      const snapshot = await withTimeout(
        publishHomeCaseStudiesSnapshot(),
        15_000,
        'publishHomeCaseStudiesSnapshot'
      )
      return NextResponse.json({
        ok: true,
        items: snapshot.items,
        slugs: snapshot.slugs,
      })
    }

    const slug = body.slug?.trim()
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'slug is required' },
        { status: 400 }
      )
    }
    const { slug: _slug, action: _action, ...fields } = body
    await withTimeout(
      updateCaseStudyFields(slug, fields),
      8_000,
      'updateCaseStudyFields'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to update case study',
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
    await withTimeout(deleteCaseStudy(slug), 8_000, 'deleteCaseStudy')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete case study',
      },
      { status: 500 }
    )
  }
}
