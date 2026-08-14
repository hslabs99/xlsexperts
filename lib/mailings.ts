/**
 * Marketing mailings — contacts, campaigns, and outbound activity.
 * Shared types (safe for client + server).
 */

export const MAILING_CONTACT_STATUSES = ['prospect', 'client'] as const
export type MailingContactStatus = (typeof MAILING_CONTACT_STATUSES)[number]

export const MAILING_REGIONS = ['NZ', 'International'] as const
export type MailingRegion = (typeof MAILING_REGIONS)[number]

export const MAILING_CONTACT_SOURCES = [
  'upload',
  'manual',
  'enquiry',
  'discovery',
] as const
export type MailingContactSource = (typeof MAILING_CONTACT_SOURCES)[number]

export const MAILING_CAMPAIGN_STATUSES = [
  'draft',
  'sending',
  'sent',
  'failed',
] as const
export type MailingCampaignStatus = (typeof MAILING_CAMPAIGN_STATUSES)[number]

export const MAILING_SEND_STATUSES = [
  'queued',
  'accepted',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'dropped',
  'failed',
  'unsubscribed',
] as const
export type MailingSendStatus = (typeof MAILING_SEND_STATUSES)[number]

export type MailingContact = {
  id: string
  /** Contact person / primary label */
  contact: string
  /** Person name (merge / display) */
  name: string
  email: string
  company: string
  sector: string
  status: MailingContactStatus
  region: MailingRegion
  source: MailingContactSource
  /** Campaign ids this contact has been sent */
  campaignTags: string[]
  unsubscribed: boolean
  unsubscribedAt: unknown
  /** Ever opened any campaign email */
  hasOpened: boolean
  /** Ever clicked a link in a campaign email */
  hasClicked: boolean
  /** hasOpened || hasClicked */
  hasEngaged: boolean
  openCount: number
  clickCount: number
  lastOpenedAt: unknown
  lastClickedAt: unknown
  lastSentAt: unknown
  notes: string
  createdAt: unknown
  updatedAt: unknown
}

export type MailingContactInput = {
  contact?: string
  name: string
  email: string
  company?: string
  sector?: string
  status?: MailingContactStatus
  region?: MailingRegion
  source?: MailingContactSource
  notes?: string
}

export type MailingAudienceFilter = {
  statuses?: MailingContactStatus[]
  sectors?: string[]
  regions?: MailingRegion[]
  /** Explicit contact ids (manual selection) */
  contactIds?: string[]
  /** Exclude contacts who already have any of these campaign tags */
  excludeCampaignTags?: string[]
  /** Only contacts who have all of these campaign tags */
  requireCampaignTags?: string[]
  /** Include unsubscribed (default false) */
  includeUnsubscribed?: boolean
}

/** Named, reusable filter set of contacts for campaigns. */
export type MailingAudience = {
  id: string
  name: string
  description: string
  filter: MailingAudienceFilter
  createdAt: unknown
  updatedAt: unknown
}

export type MailingAudienceInput = {
  name: string
  description?: string
  filter?: MailingAudienceFilter
}

export type MailingCampaignStats = {
  targeted: number
  sent: number
  accepted: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  failed: number
  unsubscribed: number
}

export type MailingCampaign = {
  id: string
  name: string
  subject: string
  htmlBody: string
  textBody: string
  status: MailingCampaignStatus
  /** Saved audience this campaign targets */
  audienceId: string
  /** Denormalised name for list views */
  audienceName: string
  /**
   * Legacy / snapshot filter. Prefer audienceId; used as fallback for older
   * campaigns and optionally snapshotted at send time.
   */
  audience: MailingAudienceFilter
  stats: MailingCampaignStats
  sentAt: unknown
  createdAt: unknown
  updatedAt: unknown
}

export type MailingCampaignInput = {
  name: string
  subject: string
  htmlBody: string
  textBody?: string
  audienceId?: string
  audienceName?: string
  /** @deprecated Prefer audienceId; kept for legacy/snapshot */
  audience?: MailingAudienceFilter
  status?: MailingCampaignStatus
}

export type MailingSendEvent = {
  type: string
  at: unknown
  url?: string
  rawEvent?: string
}

export type MailingSend = {
  id: string
  campaignId: string
  contactId: string
  email: string
  status: MailingSendStatus
  messageId: string
  openedAt: unknown
  clickedAt: unknown
  lastClickUrl: string
  events: MailingSendEvent[]
  error: string
  createdAt: unknown
  updatedAt: unknown
}

export const EMPTY_CAMPAIGN_STATS: MailingCampaignStats = {
  targeted: 0,
  sent: 0,
  accepted: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounced: 0,
  failed: 0,
  unsubscribed: 0,
}

export function isMailingContactStatus(
  value: unknown
): value is MailingContactStatus {
  return (
    typeof value === 'string' &&
    (MAILING_CONTACT_STATUSES as readonly string[]).includes(value)
  )
}

export function isMailingRegion(value: unknown): value is MailingRegion {
  return (
    typeof value === 'string' &&
    (MAILING_REGIONS as readonly string[]).includes(value)
  )
}

export function parseMailingAudienceFilter(
  raw: unknown
): MailingAudienceFilter {
  if (!raw || typeof raw !== 'object') return {}
  const a = raw as Record<string, unknown>
  return {
    statuses: Array.isArray(a.statuses)
      ? a.statuses.filter(isMailingContactStatus)
      : undefined,
    sectors: Array.isArray(a.sectors)
      ? a.sectors.map(String).map((s) => s.trim()).filter(Boolean)
      : undefined,
    regions: Array.isArray(a.regions)
      ? a.regions.filter(isMailingRegion)
      : undefined,
    contactIds: Array.isArray(a.contactIds)
      ? a.contactIds.map(String).filter(Boolean)
      : undefined,
    excludeCampaignTags: Array.isArray(a.excludeCampaignTags)
      ? a.excludeCampaignTags.map(String).filter(Boolean)
      : undefined,
    requireCampaignTags: Array.isArray(a.requireCampaignTags)
      ? a.requireCampaignTags.map(String).filter(Boolean)
      : undefined,
    includeUnsubscribed: Boolean(a.includeUnsubscribed),
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Strip HTML to a rough plain-text fallback for multipart send. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}
