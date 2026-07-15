import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore'
import { EMAIL_TEMPLATES_COLLECTION, getDb } from '@/lib/firebase'
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

function mapTemplate(id: string, data: DocumentData): EmailTemplate {
  const kind = EMAIL_TEMPLATE_KINDS.includes(data.kind)
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
  const snap = await getDocs(
    query(collection(getDb(), EMAIL_TEMPLATES_COLLECTION), orderBy('name', 'asc'))
  )
  return snap.docs.map((d) => mapTemplate(d.id, d.data()))
}

export async function fetchEmailTemplateById(
  id: string
): Promise<EmailTemplate | null> {
  const snap = await getDoc(doc(getDb(), EMAIL_TEMPLATES_COLLECTION, id))
  if (!snap.exists()) return null
  return mapTemplate(snap.id, snap.data())
}

/**
 * Active template for a kind. Prefers active docs; falls back to any of that kind.
 */
export async function fetchActiveEmailTemplate(
  kind: EmailTemplateKind
): Promise<EmailTemplate | null> {
  const snap = await getDocs(
    query(
      collection(getDb(), EMAIL_TEMPLATES_COLLECTION),
      where('kind', '==', kind)
    )
  )
  const templates = snap.docs.map((d) => mapTemplate(d.id, d.data()))
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

  const ref = await addDoc(collection(getDb(), EMAIL_TEMPLATES_COLLECTION), {
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEmailTemplate(
  id: string,
  input: Partial<EmailTemplateInput>
): Promise<void> {
  const payload: UpdateData<DocumentData> = {
    updatedAt: serverTimestamp(),
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

  await updateDoc(doc(getDb(), EMAIL_TEMPLATES_COLLECTION, id), payload)
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), EMAIL_TEMPLATES_COLLECTION, id))
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
