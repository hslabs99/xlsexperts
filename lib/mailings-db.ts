import 'server-only'

import { FieldValue, type Query } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  MAILING_AUDIENCES_COLLECTION,
  MAILING_CAMPAIGNS_COLLECTION,
  MAILING_CONTACTS_COLLECTION,
  MAILING_SENDS_COLLECTION,
} from '@/lib/firebase'
import {
  EMPTY_CAMPAIGN_STATS,
  htmlToPlainText,
  isMailingContactSource,
  isMailingContactStatus,
  isMailingRegion,
  normalizeEmail,
  parseMailingAudienceFilter,
  type MailingAudience,
  type MailingAudienceFilter,
  type MailingAudienceInput,
  type MailingCampaign,
  type MailingCampaignInput,
  type MailingCampaignStats,
  type MailingCampaignStatus,
  type MailingContact,
  type MailingContactInput,
  type MailingContactStatus,
  type MailingRegion,
  type MailingSend,
  type MailingSendEvent,
  type MailingSendStatus,
} from '@/lib/mailings'

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map(String).filter(Boolean)
}

function mapContact(
  id: string,
  data: Record<string, unknown>
): MailingContact {
  const status: MailingContactStatus = isMailingContactStatus(data.status)
    ? data.status
    : 'prospect'
  const region: MailingRegion = isMailingRegion(data.region)
    ? data.region
    : 'NZ'
  const source = isMailingContactSource(data.source) ? data.source : 'manual'

  const hasOpened = Boolean(data.hasOpened)
  const hasClicked = Boolean(data.hasClicked)

  return {
    id,
    contact: String(data.contact ?? ''),
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    company: String(data.company ?? ''),
    sector: String(data.sector ?? ''),
    status,
    region,
    source,
    campaignTags: asStringArray(data.campaignTags),
    unsubscribed: Boolean(data.unsubscribed),
    unsubscribedAt: data.unsubscribedAt ?? null,
    hasOpened,
    hasClicked,
    hasEngaged: Boolean(data.hasEngaged) || hasOpened || hasClicked,
    openCount: Number(data.openCount ?? 0) || 0,
    clickCount: Number(data.clickCount ?? 0) || 0,
    lastOpenedAt: data.lastOpenedAt ?? null,
    lastClickedAt: data.lastClickedAt ?? null,
    lastSentAt: data.lastSentAt ?? null,
    notes: String(data.notes ?? ''),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

function mapAudience(
  id: string,
  data: Record<string, unknown>
): MailingAudience {
  return {
    id,
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    filter: parseMailingAudienceFilter(data.filter ?? data.audience),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

function mapCampaign(
  id: string,
  data: Record<string, unknown>
): MailingCampaign {
  const status = (
    ['draft', 'sending', 'sent', 'failed'] as MailingCampaignStatus[]
  ).includes(data.status as MailingCampaignStatus)
    ? (data.status as MailingCampaignStatus)
    : 'draft'
  const statsRaw =
    data.stats && typeof data.stats === 'object'
      ? (data.stats as Record<string, unknown>)
      : {}

  const stats: MailingCampaignStats = {
    ...EMPTY_CAMPAIGN_STATS,
    targeted: Number(statsRaw.targeted ?? 0) || 0,
    sent: Number(statsRaw.sent ?? 0) || 0,
    accepted: Number(statsRaw.accepted ?? 0) || 0,
    delivered: Number(statsRaw.delivered ?? 0) || 0,
    opened: Number(statsRaw.opened ?? 0) || 0,
    clicked: Number(statsRaw.clicked ?? 0) || 0,
    bounced: Number(statsRaw.bounced ?? 0) || 0,
    failed: Number(statsRaw.failed ?? 0) || 0,
    unsubscribed: Number(statsRaw.unsubscribed ?? 0) || 0,
  }

  return {
    id,
    name: String(data.name ?? ''),
    subject: String(data.subject ?? ''),
    htmlBody: String(data.htmlBody ?? ''),
    textBody: String(data.textBody ?? ''),
    status,
    audienceId: String(data.audienceId ?? ''),
    audienceName: String(data.audienceName ?? ''),
    audience: parseMailingAudienceFilter(data.audience),
    stats,
    sentAt: data.sentAt ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

function mapSend(id: string, data: Record<string, unknown>): MailingSend {
  const eventsRaw = Array.isArray(data.events) ? data.events : []
  const events: MailingSendEvent[] = eventsRaw.map((e) => {
    const row = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>
    return {
      type: String(row.type ?? ''),
      at: row.at ?? null,
      url: typeof row.url === 'string' ? row.url : undefined,
      rawEvent: typeof row.rawEvent === 'string' ? row.rawEvent : undefined,
    }
  })

  const status = (
    [
      'queued',
      'accepted',
      'delivered',
      'opened',
      'clicked',
      'bounced',
      'dropped',
      'failed',
      'unsubscribed',
    ] as MailingSendStatus[]
  ).includes(data.status as MailingSendStatus)
    ? (data.status as MailingSendStatus)
    : 'queued'

  return {
    id,
    campaignId: String(data.campaignId ?? ''),
    contactId: String(data.contactId ?? ''),
    email: String(data.email ?? ''),
    status,
    messageId: String(data.messageId ?? ''),
    openedAt: data.openedAt ?? null,
    clickedAt: data.clickedAt ?? null,
    lastClickUrl: String(data.lastClickUrl ?? ''),
    events,
    error: String(data.error ?? ''),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

export async function fetchAllMailingContacts(): Promise<MailingContact[]> {
  const snap = await getAdminDb()
    .collection(MAILING_CONTACTS_COLLECTION)
    .orderBy('updatedAt', 'desc')
    .get()
  return snap.docs.map((d) =>
    mapContact(d.id, d.data() as Record<string, unknown>)
  )
}

export async function fetchMailingContactById(
  id: string
): Promise<MailingContact | null> {
  const doc = await getAdminDb()
    .collection(MAILING_CONTACTS_COLLECTION)
    .doc(id)
    .get()
  if (!doc.exists) return null
  return mapContact(doc.id, doc.data() as Record<string, unknown>)
}

export async function findMailingContactByEmail(
  email: string
): Promise<MailingContact | null> {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  const snap = await getAdminDb()
    .collection(MAILING_CONTACTS_COLLECTION)
    .where('email', '==', normalized)
    .limit(1)
    .get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  return mapContact(doc.id, doc.data() as Record<string, unknown>)
}

export async function createMailingContact(
  input: MailingContactInput
): Promise<string> {
  const email = normalizeEmail(input.email)
  if (!email) throw new Error('Email is required')

  const existing = await findMailingContactByEmail(email)
  if (existing) {
    throw new Error('A contact with this email already exists')
  }

  const name = input.name.trim()
  const contact = (input.contact?.trim() || name).trim()
  const ref = await getAdminDb().collection(MAILING_CONTACTS_COLLECTION).add({
    contact,
    name,
    email,
    company: input.company?.trim() || '',
    sector: input.sector?.trim() || '',
    status: isMailingContactStatus(input.status) ? input.status : 'prospect',
    region: isMailingRegion(input.region) ? input.region : 'NZ',
    source: input.source || 'manual',
    campaignTags: [],
    unsubscribed: false,
    unsubscribedAt: null,
    hasOpened: false,
    hasClicked: false,
    hasEngaged: false,
    openCount: 0,
    clickCount: 0,
    lastOpenedAt: null,
    lastClickedAt: null,
    lastSentAt: null,
    notes: input.notes?.trim() || '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateMailingContact(
  id: string,
  patch: Partial<MailingContactInput> & {
    unsubscribed?: boolean
    campaignTags?: string[]
  }
): Promise<void> {
  const data: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (patch.contact !== undefined) data.contact = patch.contact.trim()
  if (patch.name !== undefined) data.name = patch.name.trim()
  if (patch.email !== undefined) data.email = normalizeEmail(patch.email)
  if (patch.company !== undefined) data.company = patch.company.trim()
  if (patch.sector !== undefined) data.sector = patch.sector.trim()
  if (patch.status !== undefined && isMailingContactStatus(patch.status)) {
    data.status = patch.status
  }
  if (patch.region !== undefined && isMailingRegion(patch.region)) {
    data.region = patch.region
  }
  if (patch.notes !== undefined) data.notes = patch.notes.trim()
  if (patch.unsubscribed !== undefined) {
    data.unsubscribed = patch.unsubscribed
    data.unsubscribedAt = patch.unsubscribed
      ? FieldValue.serverTimestamp()
      : null
  }
  if (patch.campaignTags !== undefined) {
    data.campaignTags = patch.campaignTags
  }

  await getAdminDb()
    .collection(MAILING_CONTACTS_COLLECTION)
    .doc(id)
    .update(data)
}

export async function deleteMailingContact(id: string): Promise<void> {
  await getAdminDb().collection(MAILING_CONTACTS_COLLECTION).doc(id).delete()
}

/**
 * Upsert a prospect from enquiry / discovery booking / guide download.
 * Never downgrades client → prospect. Preserves unsubscribe.
 */
export async function upsertProspectFromLead(input: {
  name: string
  email: string
  company?: string
  source: 'enquiry' | 'discovery' | 'guide'
  sector?: string
  region?: MailingRegion
  notes?: string
  campaignTag?: string
}): Promise<string | null> {
  const email = normalizeEmail(input.email)
  if (!email) return null

  const existing = await findMailingContactByEmail(email)
  if (existing) {
    const patch: Parameters<typeof updateMailingContact>[1] = {}
    if (input.name.trim() && !existing.name) patch.name = input.name.trim()
    if (input.name.trim() && !existing.contact) {
      patch.contact = input.name.trim()
    }
    if (input.company?.trim() && !existing.company) {
      patch.company = input.company.trim()
    }
    if (input.sector?.trim() && !existing.sector) {
      patch.sector = input.sector.trim()
    }
    if (input.notes?.trim()) {
      const line = input.notes.trim()
      const existingNotes = existing.notes?.trim() || ''
      if (!existingNotes.includes(line)) {
        patch.notes = existingNotes ? `${existingNotes}\n${line}` : line
      }
    }
    if (input.campaignTag?.trim()) {
      const tags = new Set(existing.campaignTags)
      tags.add(input.campaignTag.trim())
      patch.campaignTags = [...tags]
    }
    if (Object.keys(patch).length > 0) {
      await updateMailingContact(existing.id, patch)
    }
    return existing.id
  }

  const id = await createMailingContact({
    contact: input.name.trim(),
    name: input.name.trim(),
    email,
    company: input.company?.trim() || '',
    sector: input.sector?.trim() || '',
    status: 'prospect',
    region: input.region ?? 'NZ',
    source: input.source,
    notes: input.notes?.trim() || '',
  })
  if (input.campaignTag?.trim()) {
    await updateMailingContact(id, {
      campaignTags: [input.campaignTag.trim()],
    })
  }
  return id
}

export async function bulkUpsertMailingContacts(
  rows: MailingContactInput[]
): Promise<{ created: number; updated: number; errors: string[] }> {
  let created = 0
  let updated = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const email = normalizeEmail(row.email || '')
    if (!email) {
      errors.push(`Row ${i + 1}: missing email`)
      continue
    }
    if (!row.name?.trim() && !row.contact?.trim()) {
      errors.push(`Row ${i + 1}: missing name/contact`)
      continue
    }
    try {
      const existing = await findMailingContactByEmail(email)
      const name = (row.name?.trim() || row.contact?.trim() || '').trim()
      const contact = (row.contact?.trim() || name).trim()
      if (existing) {
        await updateMailingContact(existing.id, {
          contact,
          name,
          company: row.company,
          sector: row.sector,
          status: row.status,
          region: row.region,
          notes: row.notes,
        })
        updated += 1
      } else {
        await createMailingContact({
          ...row,
          contact,
          name,
          email,
          source: row.source || 'upload',
        })
        created += 1
      }
    } catch (error) {
      errors.push(
        `Row ${i + 1}: ${error instanceof Error ? error.message : 'failed'}`
      )
    }
  }

  return { created, updated, errors }
}

export async function markContactUnsubscribed(
  contactId: string,
  email: string
): Promise<boolean> {
  const contact = await fetchMailingContactById(contactId)
  if (!contact) return false
  if (normalizeEmail(contact.email) !== normalizeEmail(email)) return false
  if (contact.unsubscribed) return true
  await updateMailingContact(contactId, { unsubscribed: true })
  return true
}

function contactMatchesAudience(
  contact: MailingContact,
  audience: MailingAudienceFilter
): boolean {
  if (!audience.includeUnsubscribed && contact.unsubscribed) return false

  if (audience.contactIds && audience.contactIds.length > 0) {
    if (!audience.contactIds.includes(contact.id)) return false
  }

  if (audience.statuses && audience.statuses.length > 0) {
    if (!audience.statuses.includes(contact.status)) return false
  }

  if (audience.sectors && audience.sectors.length > 0) {
    const sectorSet = new Set(
      audience.sectors.map((s) => s.trim().toLowerCase()).filter(Boolean)
    )
    if (!sectorSet.has(contact.sector.trim().toLowerCase())) return false
  }

  if (audience.regions && audience.regions.length > 0) {
    if (!audience.regions.includes(contact.region)) return false
  }

  if (audience.excludeCampaignTags && audience.excludeCampaignTags.length > 0) {
    const tags = new Set(contact.campaignTags)
    if (audience.excludeCampaignTags.some((t) => tags.has(t))) return false
  }

  if (audience.requireCampaignTags && audience.requireCampaignTags.length > 0) {
    const tags = new Set(contact.campaignTags)
    if (!audience.requireCampaignTags.every((t) => tags.has(t))) return false
  }

  return true
}

export async function resolveAudience(
  audience: MailingAudienceFilter
): Promise<MailingContact[]> {
  const all = await fetchAllMailingContacts()
  return all.filter((c) => contactMatchesAudience(c, audience))
}

/**
 * Resolve recipients for a campaign from its saved audience (or legacy inline filter).
 */
export async function resolveCampaignAudience(
  campaign: MailingCampaign
): Promise<{ contacts: MailingContact[]; filter: MailingAudienceFilter; audienceName: string }> {
  if (campaign.audienceId) {
    const saved = await fetchMailingAudienceById(campaign.audienceId)
    if (!saved) {
      throw new Error('Campaign audience not found — pick another audience')
    }
    const contacts = await resolveAudience(saved.filter)
    return {
      contacts,
      filter: saved.filter,
      audienceName: saved.name,
    }
  }
  const filter = campaign.audience || {}
  const contacts = await resolveAudience(filter)
  return {
    contacts,
    filter,
    audienceName: campaign.audienceName || 'Legacy audience',
  }
}

export async function fetchAllMailingAudiences(): Promise<MailingAudience[]> {
  const snap = await getAdminDb()
    .collection(MAILING_AUDIENCES_COLLECTION)
    .orderBy('updatedAt', 'desc')
    .get()
  return snap.docs.map((d) =>
    mapAudience(d.id, d.data() as Record<string, unknown>)
  )
}

export async function fetchMailingAudienceById(
  id: string
): Promise<MailingAudience | null> {
  const doc = await getAdminDb()
    .collection(MAILING_AUDIENCES_COLLECTION)
    .doc(id)
    .get()
  if (!doc.exists) return null
  return mapAudience(doc.id, doc.data() as Record<string, unknown>)
}

export async function createMailingAudience(
  input: MailingAudienceInput
): Promise<string> {
  const name = input.name.trim()
  if (!name) throw new Error('Audience name is required')
  const ref = await getAdminDb().collection(MAILING_AUDIENCES_COLLECTION).add({
    name,
    description: input.description?.trim() || '',
    filter: input.filter || {},
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateMailingAudience(
  id: string,
  patch: Partial<MailingAudienceInput>
): Promise<void> {
  const data: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (patch.name !== undefined) data.name = patch.name.trim()
  if (patch.description !== undefined) {
    data.description = patch.description.trim()
  }
  if (patch.filter !== undefined) data.filter = patch.filter
  await getAdminDb()
    .collection(MAILING_AUDIENCES_COLLECTION)
    .doc(id)
    .update(data)
}

export async function deleteMailingAudience(id: string): Promise<void> {
  await getAdminDb().collection(MAILING_AUDIENCES_COLLECTION).doc(id).delete()
}

export async function fetchAllMailingCampaigns(): Promise<MailingCampaign[]> {
  const snap = await getAdminDb()
    .collection(MAILING_CAMPAIGNS_COLLECTION)
    .orderBy('updatedAt', 'desc')
    .get()
  return snap.docs.map((d) =>
    mapCampaign(d.id, d.data() as Record<string, unknown>)
  )
}

export async function fetchMailingCampaignById(
  id: string
): Promise<MailingCampaign | null> {
  const doc = await getAdminDb()
    .collection(MAILING_CAMPAIGNS_COLLECTION)
    .doc(id)
    .get()
  if (!doc.exists) return null
  return mapCampaign(doc.id, doc.data() as Record<string, unknown>)
}

export async function createMailingCampaign(
  input: MailingCampaignInput
): Promise<string> {
  const htmlBody = input.htmlBody?.trim() || ''
  const textBody =
    input.textBody?.trim() ||
    (htmlBody ? htmlToPlainText(htmlBody) : ' ')
  const ref = await getAdminDb().collection(MAILING_CAMPAIGNS_COLLECTION).add({
    name: input.name.trim(),
    subject: input.subject.trim(),
    htmlBody,
    textBody,
    status: input.status || 'draft',
    audienceId: input.audienceId?.trim() || '',
    audienceName: input.audienceName?.trim() || '',
    audience: input.audience || {},
    stats: { ...EMPTY_CAMPAIGN_STATS },
    sentAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateMailingCampaign(
  id: string,
  patch: Partial<MailingCampaignInput> & {
    stats?: Partial<MailingCampaignStats>
    sentAt?: unknown
  }
): Promise<void> {
  const data: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (patch.name !== undefined) data.name = patch.name.trim()
  if (patch.subject !== undefined) data.subject = patch.subject.trim()
  if (patch.htmlBody !== undefined) {
    data.htmlBody = patch.htmlBody
    if (patch.textBody === undefined) {
      data.textBody = htmlToPlainText(patch.htmlBody) || ' '
    }
  }
  if (patch.textBody !== undefined) {
    data.textBody = patch.textBody.trim() || ' '
  }
  if (patch.audienceId !== undefined) {
    data.audienceId = patch.audienceId.trim()
  }
  if (patch.audienceName !== undefined) {
    data.audienceName = patch.audienceName.trim()
  }
  if (patch.audience !== undefined) data.audience = patch.audience
  if (patch.status !== undefined) data.status = patch.status
  if (patch.stats !== undefined) {
    for (const [key, value] of Object.entries(patch.stats)) {
      data[`stats.${key}`] = value
    }
  }
  if (patch.sentAt !== undefined) data.sentAt = patch.sentAt

  await getAdminDb()
    .collection(MAILING_CAMPAIGNS_COLLECTION)
    .doc(id)
    .update(data)
}

export async function deleteMailingCampaign(id: string): Promise<void> {
  await getAdminDb().collection(MAILING_CAMPAIGNS_COLLECTION).doc(id).delete()
}

export async function fetchSendsForCampaign(
  campaignId: string
): Promise<MailingSend[]> {
  const snap = await getAdminDb()
    .collection(MAILING_SENDS_COLLECTION)
    .where('campaignId', '==', campaignId)
    .get()
  const rows = snap.docs.map((d) =>
    mapSend(d.id, d.data() as Record<string, unknown>)
  )
  rows.sort((a, b) => {
    const am = timestampMs(a.createdAt)
    const bm = timestampMs(b.createdAt)
    return bm - am
  })
  return rows
}

export async function fetchSendsForContact(
  contactId: string
): Promise<MailingSend[]> {
  const snap = await getAdminDb()
    .collection(MAILING_SENDS_COLLECTION)
    .where('contactId', '==', contactId)
    .get()
  const rows = snap.docs.map((d) =>
    mapSend(d.id, d.data() as Record<string, unknown>)
  )
  rows.sort((a, b) => {
    const am = timestampMs(a.createdAt)
    const bm = timestampMs(b.createdAt)
    return bm - am
  })
  return rows
}

function timestampMs(value: unknown): number {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().getTime()
    } catch {
      return 0
    }
  }
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isFinite(t) ? t : 0
  }
  return 0
}

export async function createMailingSend(input: {
  campaignId: string
  contactId: string
  email: string
  status?: MailingSendStatus
  messageId?: string
  error?: string
}): Promise<string> {
  const ref = await getAdminDb().collection(MAILING_SENDS_COLLECTION).add({
    campaignId: input.campaignId,
    contactId: input.contactId,
    email: normalizeEmail(input.email),
    status: input.status || 'queued',
    messageId: input.messageId || '',
    openedAt: null,
    clickedAt: null,
    lastClickUrl: '',
    events: [],
    error: input.error || '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateMailingSend(
  id: string,
  patch: Partial<{
    status: MailingSendStatus
    messageId: string
    error: string
    openedAt: unknown
    clickedAt: unknown
    lastClickUrl: string
  }>
): Promise<void> {
  const data: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (patch.status !== undefined) data.status = patch.status
  if (patch.messageId !== undefined) data.messageId = patch.messageId
  if (patch.error !== undefined) data.error = patch.error
  if (patch.openedAt !== undefined) data.openedAt = patch.openedAt
  if (patch.clickedAt !== undefined) data.clickedAt = patch.clickedAt
  if (patch.lastClickUrl !== undefined) data.lastClickUrl = patch.lastClickUrl

  await getAdminDb().collection(MAILING_SENDS_COLLECTION).doc(id).update(data)
}

export async function appendMailingSendEvent(
  sendId: string,
  event: MailingSendEvent
): Promise<void> {
  await getAdminDb()
    .collection(MAILING_SENDS_COLLECTION)
    .doc(sendId)
    .update({
      events: FieldValue.arrayUnion(event),
      updatedAt: FieldValue.serverTimestamp(),
    })
}

export async function addCampaignTagToContact(
  contactId: string,
  campaignId: string
): Promise<void> {
  await getAdminDb()
    .collection(MAILING_CONTACTS_COLLECTION)
    .doc(contactId)
    .update({
      campaignTags: FieldValue.arrayUnion(campaignId),
      lastSentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
}

export async function markContactEngagement(
  contactId: string,
  kind: 'open' | 'click'
): Promise<void> {
  const data: Record<string, unknown> = {
    hasEngaged: true,
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (kind === 'open') {
    data.hasOpened = true
    data.openCount = FieldValue.increment(1)
    data.lastOpenedAt = FieldValue.serverTimestamp()
  } else {
    data.hasClicked = true
    data.clickCount = FieldValue.increment(1)
    data.lastClickedAt = FieldValue.serverTimestamp()
  }
  await getAdminDb()
    .collection(MAILING_CONTACTS_COLLECTION)
    .doc(contactId)
    .update(data)
}

export async function incrementCampaignStat(
  campaignId: string,
  field: keyof MailingCampaignStats,
  by = 1
): Promise<void> {
  await getAdminDb()
    .collection(MAILING_CAMPAIGNS_COLLECTION)
    .doc(campaignId)
    .update({
      [`stats.${field}`]: FieldValue.increment(by),
      updatedAt: FieldValue.serverTimestamp(),
    })
}

export async function findMailingSendById(
  sendId: string
): Promise<MailingSend | null> {
  const doc = await getAdminDb()
    .collection(MAILING_SENDS_COLLECTION)
    .doc(sendId)
    .get()
  if (!doc.exists) return null
  return mapSend(doc.id, doc.data() as Record<string, unknown>)
}

/** Find send by custom-arg send_id or message id prefix. */
export async function findMailingSendForEvent(input: {
  sendId?: string
  messageId?: string
  campaignId?: string
  contactId?: string
  email?: string
}): Promise<MailingSend | null> {
  if (input.sendId) {
    const byId = await findMailingSendById(input.sendId)
    if (byId) return byId
  }

  if (input.messageId) {
    const mid = input.messageId.split('.')[0]
    let q: Query = getAdminDb()
      .collection(MAILING_SENDS_COLLECTION)
      .where('messageId', '==', mid)
      .limit(1)
    let snap = await q.get()
    if (!snap.empty) {
      return mapSend(
        snap.docs[0].id,
        snap.docs[0].data() as Record<string, unknown>
      )
    }
    q = getAdminDb()
      .collection(MAILING_SENDS_COLLECTION)
      .where('messageId', '==', input.messageId)
      .limit(1)
    snap = await q.get()
    if (!snap.empty) {
      return mapSend(
        snap.docs[0].id,
        snap.docs[0].data() as Record<string, unknown>
      )
    }
  }

  if (input.campaignId && input.contactId) {
    const snap = await getAdminDb()
      .collection(MAILING_SENDS_COLLECTION)
      .where('campaignId', '==', input.campaignId)
      .limit(50)
      .get()
    const rows = snap.docs
      .map((d) => mapSend(d.id, d.data() as Record<string, unknown>))
      .filter((s) => s.contactId === input.contactId)
    if (rows.length > 0) {
      rows.sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt))
      return rows[0]
    }
  }

  if (input.campaignId && input.email) {
    const snap = await getAdminDb()
      .collection(MAILING_SENDS_COLLECTION)
      .where('campaignId', '==', input.campaignId)
      .limit(50)
      .get()
    const email = normalizeEmail(input.email)
    const rows = snap.docs
      .map((d) => mapSend(d.id, d.data() as Record<string, unknown>))
      .filter((s) => s.email === email)
    if (rows.length > 0) {
      rows.sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt))
      return rows[0]
    }
  }

  return null
}

export function listDistinctSectors(contacts: MailingContact[]): string[] {
  const set = new Set<string>()
  for (const c of contacts) {
    const s = c.sector.trim()
    if (s) set.add(s)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}
