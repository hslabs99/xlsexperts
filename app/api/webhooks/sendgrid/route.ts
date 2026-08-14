/**
 * SendGrid Event Webhook for mailing open / click / delivery / bounce.
 *
 * Configure in SendGrid → Settings → Mail Settings → Event Webhook:
 *   POST https://www.xlsexperts.co.nz/api/webhooks/sendgrid
 * Enable: Delivered, Opened, Clicked, Bounced, Dropped, Unsubscribed
 *
 * Custom args campaign_id / contact_id / send_id must be enabled on the webhook.
 */

import { NextResponse } from 'next/server'
import {
  appendMailingSendEvent,
  findMailingSendForEvent,
  incrementCampaignStat,
  markContactEngagement,
  markContactUnsubscribed,
  updateMailingSend,
} from '@/lib/mailings-db'
import type { MailingSendStatus } from '@/lib/mailings'

type SgEvent = {
  event?: string
  email?: string
  timestamp?: number
  url?: string
  sg_message_id?: string
  campaign_id?: string
  contact_id?: string
  send_id?: string
  [key: string]: unknown
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export async function POST(request: Request) {
  let events: SgEvent[]
  try {
    const body = await request.json()
    events = Array.isArray(body) ? (body as SgEvent[]) : [body as SgEvent]
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  let processed = 0

  for (const ev of events) {
    const eventName = asString(ev.event).toLowerCase()
    if (!eventName) continue

    const send = await findMailingSendForEvent({
      sendId: asString(ev.send_id) || undefined,
      messageId: asString(ev.sg_message_id) || undefined,
      campaignId: asString(ev.campaign_id) || undefined,
      contactId: asString(ev.contact_id) || undefined,
      email: asString(ev.email) || undefined,
    })

    if (!send) continue

    const at =
      typeof ev.timestamp === 'number'
        ? new Date(ev.timestamp * 1000)
        : new Date()

    await appendMailingSendEvent(send.id, {
      type: eventName,
      at: at.toISOString(),
      url: asString(ev.url) || undefined,
      rawEvent: eventName,
    })

    try {
      if (eventName === 'delivered') {
        if (send.status === 'accepted' || send.status === 'queued') {
          await updateMailingSend(send.id, { status: 'delivered' })
          await incrementCampaignStat(send.campaignId, 'delivered')
        }
      } else if (eventName === 'open') {
        const firstOpen = !send.openedAt
        await updateMailingSend(send.id, {
          status: send.status === 'clicked' ? 'clicked' : 'opened',
          openedAt: send.openedAt || at,
        })
        await markContactEngagement(send.contactId, 'open')
        if (firstOpen) {
          await incrementCampaignStat(send.campaignId, 'opened')
        }
      } else if (eventName === 'click') {
        const firstClick = !send.clickedAt
        await updateMailingSend(send.id, {
          status: 'clicked',
          clickedAt: send.clickedAt || at,
          openedAt: send.openedAt || at,
          lastClickUrl: asString(ev.url),
        })
        await markContactEngagement(send.contactId, 'click')
        if (!send.openedAt) {
          await markContactEngagement(send.contactId, 'open')
          await incrementCampaignStat(send.campaignId, 'opened')
        }
        if (firstClick) {
          await incrementCampaignStat(send.campaignId, 'clicked')
        }
      } else if (eventName === 'bounce' || eventName === 'dropped') {
        const status: MailingSendStatus =
          eventName === 'bounce' ? 'bounced' : 'dropped'
        await updateMailingSend(send.id, { status })
        if (eventName === 'bounce') {
          await incrementCampaignStat(send.campaignId, 'bounced')
        }
      } else if (
        eventName === 'unsubscribe' ||
        eventName === 'group_unsubscribe'
      ) {
        await updateMailingSend(send.id, { status: 'unsubscribed' })
        await markContactUnsubscribed(send.contactId, send.email)
        await incrementCampaignStat(send.campaignId, 'unsubscribed')
      }
      processed += 1
    } catch (error) {
      console.error('[webhooks/sendgrid] event handling failed', {
        eventName,
        sendId: send.id,
        message: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return NextResponse.json({ ok: true, processed })
}
