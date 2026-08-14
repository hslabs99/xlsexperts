/**
 * Admin mailing audiences API — reusable contact filter sets.
 *
 * GET    — list audiences, or one + preview count (?id=)
 * POST   — create, or { action: 'preview', filter | audienceId }
 * PATCH  — update
 * DELETE — delete (?id=)
 */

import { NextResponse } from 'next/server'
import {
  createMailingAudience,
  deleteMailingAudience,
  fetchAllMailingAudiences,
  fetchMailingAudienceById,
  resolveAudience,
  updateMailingAudience,
} from '@/lib/mailings-db'
import { parseMailingAudienceFilter } from '@/lib/mailings'
import { withTimeout } from '@/lib/with-timeout'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()

    if (id) {
      const audience = await withTimeout(
        fetchMailingAudienceById(id),
        8_000,
        'fetchMailingAudienceById'
      )
      if (!audience) {
        return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
      }
      const contacts = await withTimeout(
        resolveAudience(audience.filter),
        15_000,
        'resolveAudience'
      )
      return NextResponse.json({
        audience,
        count: contacts.length,
        sample: contacts.slice(0, 25).map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
          status: c.status,
          sector: c.sector,
        })),
      })
    }

    const audiences = await withTimeout(
      fetchAllMailingAudiences(),
      15_000,
      'fetchAllMailingAudiences'
    )
    return NextResponse.json({ audiences })
  } catch (error) {
    console.error(
      '[admin/mailings/audiences] GET failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not load audiences' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    if (body.action === 'preview') {
      let filter = parseMailingAudienceFilter(body.filter)
      if (body.audienceId) {
        const saved = await fetchMailingAudienceById(String(body.audienceId))
        if (!saved) {
          return NextResponse.json(
            { error: 'Audience not found' },
            { status: 404 }
          )
        }
        filter = saved.filter
      }
      const contacts = await withTimeout(
        resolveAudience(filter),
        15_000,
        'resolveAudience'
      )
      return NextResponse.json({
        count: contacts.length,
        sample: contacts.slice(0, 25).map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
          status: c.status,
          sector: c.sector,
        })),
      })
    }

    const name = String(body.name ?? '').trim()
    if (!name) {
      return NextResponse.json(
        { error: 'Audience name is required' },
        { status: 400 }
      )
    }

    const id = await withTimeout(
      createMailingAudience({
        name,
        description: String(body.description ?? ''),
        filter: parseMailingAudienceFilter(body.filter),
      }),
      8_000,
      'createMailingAudience'
    )
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not save audience'
    console.error('[admin/mailings/audiences] POST failed', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = String(body.id ?? '').trim()
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const patch: Parameters<typeof updateMailingAudience>[1] = {}
    if (body.name !== undefined) patch.name = String(body.name)
    if (body.description !== undefined) {
      patch.description = String(body.description)
    }
    if (body.filter !== undefined) {
      patch.filter = parseMailingAudienceFilter(body.filter)
    }

    await withTimeout(
      updateMailingAudience(id, patch),
      8_000,
      'updateMailingAudience'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[admin/mailings/audiences] PATCH failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not update audience' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')?.trim()
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  try {
    await withTimeout(
      deleteMailingAudience(id),
      8_000,
      'deleteMailingAudience'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[admin/mailings/audiences] DELETE failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not delete audience' },
      { status: 500 }
    )
  }
}
