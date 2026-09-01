import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { EMAIL_TEMPLATES_COLLECTION } from '@/lib/firebase'
import {
  DEFAULT_STANDARD_TEMPLATE,
  DEFAULT_WHITEPAPER_TEMPLATE,
  DEFAULT_EMAIL_BODY_FONT_FAMILY,
  DEFAULT_EMAIL_BODY_FONT_SIZE,
  EMAIL_TEMPLATE_KINDS,
  hasEmailAttachment,
  normalizeEmailFontSize,
  normalizeRecipients,
  type EmailTemplate,
  type EmailTemplateInput,
  type EmailTemplateKind,
} from '@/lib/email-templates'
import { discoveryPresentationAsTemplateInput } from '@/lib/email-presentation-templates'

function mapTemplate(id: string, data: Record<string, unknown>): EmailTemplate {
  const kind = EMAIL_TEMPLATE_KINDS.includes(data.kind as EmailTemplateKind)
    ? (data.kind as EmailTemplateKind)
    : 'standard'

  return {
    id,
    kind,
    name: String(data.name ?? ''),
    subject: String(data.subject ?? ''),
    htmlBody: String(data.htmlBody ?? ''),
    textBody: String(data.textBody ?? ''),
    recipients: normalizeRecipients(data.recipients, kind),
    bodyFontFamily: String(
      data.bodyFontFamily ?? DEFAULT_EMAIL_BODY_FONT_FAMILY
    ),
    bodyFontSize: normalizeEmailFontSize(
      String(data.bodyFontSize ?? DEFAULT_EMAIL_BODY_FONT_SIZE)
    ),
    active: data.active !== false,
    attachmentFilename: String(data.attachmentFilename ?? ''),
    attachmentStoragePath: String(data.attachmentStoragePath ?? ''),
    attachmentUrl: String(data.attachmentUrl ?? ''),
    attachmentContentType: String(data.attachmentContentType ?? ''),
    updatedAt: data.updatedAt ?? null,
    createdAt: data.createdAt ?? null,
  }
}

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  // Fetch without orderBy('name'): Firestore omits docs that lack that field,
  // which hid working standard templates from Admin while send still found them
  // via where('kind' == …). Sort in memory instead.
  const snap = await getAdminDb().collection(EMAIL_TEMPLATES_COLLECTION).get()
  const templates = snap.docs.map((d) =>
    mapTemplate(d.id, d.data() as Record<string, unknown>)
  )
  templates.sort((a, b) => {
    const order = (kind: string) =>
      kind === 'standard' ? 0 : kind === 'whitepaper' ? 1 : 2
    if (a.kind !== b.kind) return order(a.kind) - order(b.kind)
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
  return templates
}

export async function fetchEmailTemplateById(
  id: string
): Promise<EmailTemplate | null> {
  const snap = await getAdminDb()
    .collection(EMAIL_TEMPLATES_COLLECTION)
    .doc(id)
    .get()
  if (!snap.exists) return null
  return mapTemplate(snap.id, snap.data() as Record<string, unknown>)
}

/**
 * Active template for a kind. Prefers active docs; among those, prefers a
 * template that currently has a file attachment (so white-paper sends the
 * uploaded PDF, not an empty sibling template).
 */
export async function fetchActiveEmailTemplate(
  kind: EmailTemplateKind
): Promise<EmailTemplate | null> {
  const snap = await getAdminDb()
    .collection(EMAIL_TEMPLATES_COLLECTION)
    .where('kind', '==', kind)
    .get()
  const templates = snap.docs.map((d) =>
    mapTemplate(d.id, d.data() as Record<string, unknown>)
  )
  if (templates.length === 0) return null

  const active = templates.filter((t) => t.active)
  const pool = active.length > 0 ? active : templates
  const withFile = pool.filter(hasEmailAttachment)
  withFile.sort((a, b) => timestampMs(b.updatedAt) - timestampMs(a.updatedAt))
  return withFile[0] ?? pool[0] ?? null
}

function timestampMs(value: unknown): number {
  if (!value || typeof value !== 'object') return 0
  const v = value as { toMillis?: () => number; seconds?: number }
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (typeof v.seconds === 'number') return v.seconds * 1000
  return 0
}

export async function createEmailTemplate(
  input: EmailTemplateInput
): Promise<string> {
  const recipients =
    input.recipients ??
    normalizeRecipients(undefined, input.kind)

  const ref = await getAdminDb().collection(EMAIL_TEMPLATES_COLLECTION).add({
    kind: input.kind,
    name: input.name.trim(),
    subject: input.subject,
    htmlBody: input.htmlBody,
    textBody: input.textBody ?? '',
    recipients,
    bodyFontFamily: input.bodyFontFamily ?? DEFAULT_EMAIL_BODY_FONT_FAMILY,
    bodyFontSize: normalizeEmailFontSize(
      input.bodyFontSize ?? DEFAULT_EMAIL_BODY_FONT_SIZE
    ),
    active: input.active !== false,
    attachmentFilename: input.attachmentFilename?.trim() || '',
    attachmentStoragePath: input.attachmentStoragePath?.trim() || '',
    attachmentUrl: input.attachmentUrl?.trim() || '',
    attachmentContentType: input.attachmentContentType?.trim() || '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateEmailTemplate(
  id: string,
  input: Partial<EmailTemplateInput>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (input.kind !== undefined) payload.kind = input.kind
  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.subject !== undefined) payload.subject = input.subject
  if (input.htmlBody !== undefined) payload.htmlBody = input.htmlBody
  if (input.textBody !== undefined) payload.textBody = input.textBody
  if (input.recipients !== undefined) payload.recipients = input.recipients
  if (input.bodyFontFamily !== undefined)
    payload.bodyFontFamily = input.bodyFontFamily
  if (input.bodyFontSize !== undefined)
    payload.bodyFontSize = normalizeEmailFontSize(input.bodyFontSize)
  if (input.active !== undefined) payload.active = input.active
  if (input.attachmentFilename !== undefined)
    payload.attachmentFilename = input.attachmentFilename.trim()
  if (input.attachmentStoragePath !== undefined)
    payload.attachmentStoragePath = input.attachmentStoragePath.trim()
  if (input.attachmentUrl !== undefined)
    payload.attachmentUrl = input.attachmentUrl.trim()
  if (input.attachmentContentType !== undefined)
    payload.attachmentContentType = input.attachmentContentType.trim()

  await getAdminDb().collection(EMAIL_TEMPLATES_COLLECTION).doc(id).update(payload)
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await getAdminDb().collection(EMAIL_TEMPLATES_COLLECTION).doc(id).delete()
}

/**
 * Ensure one default template exists for each enquiry kind.
 */
export async function seedDefaultEmailTemplates(): Promise<{
  created: number
  skipped: number
}> {
  const existing = await fetchEmailTemplates()
  let created = 0
  let skipped = 0

  const defaults = [
    DEFAULT_STANDARD_TEMPLATE,
    DEFAULT_WHITEPAPER_TEMPLATE,
    await discoveryPresentationAsTemplateInput(),
  ]
  for (const def of defaults) {
    if (existing.some((t) => t.kind === def.kind)) {
      skipped += 1
      continue
    }
    await createEmailTemplate({ ...def, active: true })
    created += 1
  }

  return { created, skipped }
}
