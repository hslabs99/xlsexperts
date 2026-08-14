/**
 * Admin mailing campaigns API.
 *
 * GET    — list campaigns, or detail + sends (?id=)
 * POST   — create campaign, or { action: 'send', id }
 * PATCH  — update draft campaign
 * DELETE — delete campaign (?id=)
 */

import { NextResponse } from 'next/server'
import {
  createMailingCampaign,
  deleteMailingCampaign,
  fetchAllMailingCampaigns,
  fetchMailingAudienceById,
  fetchMailingCampaignById,
  fetchSendsForCampaign,
  updateMailingCampaign,
} from '@/lib/mailings-db'
import { sendMailingCampaign } from '@/lib/mailings-send'
import type { MailingCampaignInput } from '@/lib/mailings'
import { withTimeout } from '@/lib/with-timeout'

async function resolveAudienceMeta(audienceId: string): Promise<{
  audienceId: string
  audienceName: string
}> {
  const saved = await fetchMailingAudienceById(audienceId)
  if (!saved) {
    throw new Error('Audience not found')
  }
  return { audienceId: saved.id, audienceName: saved.name }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()

    if (id) {
      const campaign = await withTimeout(
        fetchMailingCampaignById(id),
        8_000,
        'fetchMailingCampaignById'
      )
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }
      const sends = await withTimeout(
        fetchSendsForCampaign(id),
        15_000,
        'fetchSendsForCampaign'
      )
      return NextResponse.json({ campaign, sends })
    }

    const campaigns = await withTimeout(
      fetchAllMailingCampaigns(),
      15_000,
      'fetchAllMailingCampaigns'
    )
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error(
      '[admin/mailings/campaigns] GET failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not load campaigns' },
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
    if (body.action === 'send') {
      const id = String(body.id ?? '').trim()
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }
      const result = await withTimeout(
        sendMailingCampaign(id),
        300_000,
        'sendMailingCampaign'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    const name = String(body.name ?? '').trim()
    const subject = String(body.subject ?? '').trim()
    const htmlBody = String(body.htmlBody ?? '').trim()
    const audienceId = String(body.audienceId ?? '').trim()
    if (!name || !subject) {
      return NextResponse.json(
        { error: 'Name and subject are required' },
        { status: 400 }
      )
    }
    if (!audienceId) {
      return NextResponse.json(
        { error: 'Select a saved audience' },
        { status: 400 }
      )
    }

    const meta = await resolveAudienceMeta(audienceId)
    const input: MailingCampaignInput = {
      name,
      subject,
      htmlBody,
      textBody:
        typeof body.textBody === 'string' ? body.textBody : undefined,
      audienceId: meta.audienceId,
      audienceName: meta.audienceName,
      status: 'draft',
    }

    const id = await withTimeout(
      createMailingCampaign(input),
      8_000,
      'createMailingCampaign'
    )
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not process campaign'
    console.error('[admin/mailings/campaigns] POST failed', message)
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
    const existing = await fetchMailingCampaignById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    if (existing.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot edit a campaign while it is sending' },
        { status: 409 }
      )
    }

    const patch: Parameters<typeof updateMailingCampaign>[1] = {}
    if (body.name !== undefined) patch.name = String(body.name)
    if (body.subject !== undefined) patch.subject = String(body.subject)
    if (body.htmlBody !== undefined) patch.htmlBody = String(body.htmlBody)
    if (body.textBody !== undefined) patch.textBody = String(body.textBody)
    if (body.audienceId !== undefined) {
      const audienceId = String(body.audienceId).trim()
      if (!audienceId) {
        return NextResponse.json(
          { error: 'Select a saved audience' },
          { status: 400 }
        )
      }
      const meta = await resolveAudienceMeta(audienceId)
      patch.audienceId = meta.audienceId
      patch.audienceName = meta.audienceName
    }
    if (body.status === 'draft' && existing.status !== 'sent') {
      patch.status = 'draft'
    }

    await withTimeout(
      updateMailingCampaign(id, patch),
      8_000,
      'updateMailingCampaign'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[admin/mailings/campaigns] PATCH failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not update campaign' },
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
      deleteMailingCampaign(id),
      8_000,
      'deleteMailingCampaign'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[admin/mailings/campaigns] DELETE failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not delete campaign' },
      { status: 500 }
    )
  }
}
