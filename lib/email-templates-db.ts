import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { EMAIL_TEMPLATES_COLLECTION } from '@/lib/firebase'
import {
  DEFAULT_STANDARD_TEMPLATE,
  DEFAULT_EMAIL_BODY_FONT_FAMILY,
  DEFAULT_EMAIL_BODY_FONT_SIZE,
  EMAIL_TEMPLATE_KINDS,
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
    updatedAt: data.updatedAt ?? null,
    createdAt: data.createdAt ?? null,
  }
}

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  const snap = await getAdminDb()
    .collection(EMAIL_TEMPLATES_COLLECTION)
    .orderBy('name', 'asc')
    .get()
  return snap.docs.map((d) =>
    mapTemplate(d.id, d.data() as Record<string, unknown>)
  )
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
 * Active template for a kind. Prefers active docs; falls back to any of that kind.
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
  return pool[0] ?? null
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
