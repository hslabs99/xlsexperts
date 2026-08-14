import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { sendEmail } from '@/lib/email/sendgrid'
import { isEmailError } from '@/lib/email/errors'
import {
  addCampaignTagToContact,
  createMailingSend,
  fetchMailingCampaignById,
  incrementCampaignStat,
  resolveCampaignAudience,
  updateMailingCampaign,
  updateMailingSend,
} from '@/lib/mailings-db'
import {
  appendUnsubscribeFooter,
  personalizeCampaignHtml,
} from '@/lib/mailings-unsubscribe'
import { htmlToPlainText } from '@/lib/mailings'

export type SendCampaignResult = {
  campaignId: string
  targeted: number
  accepted: number
  failed: number
  errors: string[]
}

/**
 * Resolve saved audience and send the campaign via SendGrid (one recipient at a
 * time for personalization + per-send tracking custom_args).
 */
export async function sendMailingCampaign(
  campaignId: string
): Promise<SendCampaignResult> {
  const campaign = await fetchMailingCampaignById(campaignId)
  if (!campaign) {
    throw new Error('Campaign not found')
  }
  if (!campaign.subject.trim()) {
    throw new Error('Campaign subject is required')
  }
  if (!campaign.htmlBody.trim()) {
    throw new Error('Campaign HTML body is required')
  }
  if (campaign.status === 'sending') {
    throw new Error('Campaign is already sending')
  }
  if (!campaign.audienceId && Object.keys(campaign.audience || {}).length === 0) {
    throw new Error('Select a saved audience before sending')
  }

  const {
    contacts: audience,
    filter,
    audienceName,
  } = await resolveCampaignAudience(campaign)
  if (audience.length === 0) {
    throw new Error('No matching contacts for this audience')
  }

  await updateMailingCampaign(campaignId, {
    status: 'sending',
    audienceName,
    audience: filter,
    stats: {
      targeted: audience.length,
      sent: 0,
      accepted: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0,
    },
  })

  let accepted = 0
  let failed = 0
  const errors: string[] = []

  for (const contact of audience) {
    const sendId = await createMailingSend({
      campaignId,
      contactId: contact.id,
      email: contact.email,
      status: 'queued',
    })

    const personalized = personalizeCampaignHtml(campaign.htmlBody, {
      name: contact.name || contact.contact,
      contact: contact.contact || contact.name,
      company: contact.company,
      email: contact.email,
    })
    const html = appendUnsubscribeFooter(
      personalized,
      contact.id,
      contact.email
    )
    const text =
      campaign.textBody?.trim() ||
      htmlToPlainText(html) ||
      'Please view this email in an HTML-capable client.'

    try {
      const result = await sendEmail({
        to: contact.email,
        subject: campaign.subject,
        text,
        html,
        category: 'mailing-campaign',
        referenceId: sendId.slice(0, 100),
        customArgs: {
          campaign_id: campaignId,
          contact_id: contact.id,
          send_id: sendId,
        },
        tracking: { open: true, click: true },
      })

      await updateMailingSend(sendId, {
        status: 'accepted',
        messageId: result.messageId || '',
      })
      await addCampaignTagToContact(contact.id, campaignId)
      await incrementCampaignStat(campaignId, 'sent')
      await incrementCampaignStat(campaignId, 'accepted')
      accepted += 1
    } catch (error) {
      failed += 1
      const message = isEmailError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Send failed'
      errors.push(`${contact.email}: ${message}`)
      await updateMailingSend(sendId, {
        status: 'failed',
        error: message.slice(0, 500),
      })
      await incrementCampaignStat(campaignId, 'failed')
      console.error('[mailings] campaign send failed', {
        campaignId,
        contactId: contact.id,
        message,
      })
    }
  }

  await updateMailingCampaign(campaignId, {
    status: failed > 0 && accepted === 0 ? 'failed' : 'sent',
    sentAt: FieldValue.serverTimestamp(),
  })

  return {
    campaignId,
    targeted: audience.length,
    accepted,
    failed,
    errors: errors.slice(0, 50),
  }
}
