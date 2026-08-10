import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { AI_SYSTEM_PROMPTS_COLLECTION } from '@/lib/firebase'
import {
  DEFAULT_BLOG_DRAFT_PROMPTS,
  DEFAULT_BLOG_IMAGE_PROMPTS,
  isAiSystemPromptKind,
  type AiSystemPrompt,
  type AiSystemPromptInput,
  type AiSystemPromptKind,
} from '@/lib/ai-system-prompts'

function mapPrompt(
  id: string,
  data: Record<string, unknown>
): AiSystemPrompt | null {
  if (!isAiSystemPromptKind(data.kind)) return null
  const name = String(data.name ?? '').trim()
  const systemPrompt = String(data.systemPrompt ?? '').trim()
  if (!name || !systemPrompt) return null

  return {
    id,
    kind: data.kind,
    name,
    description: String(data.description ?? '').trim(),
    systemPrompt,
    active: data.active !== false,
    sortOrder: Number(data.sortOrder ?? 0) || 0,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

export async function fetchAiSystemPrompts(
  kind?: AiSystemPromptKind
): Promise<AiSystemPrompt[]> {
  const snap = await getAdminDb().collection(AI_SYSTEM_PROMPTS_COLLECTION).get()
  const items = snap.docs
    .map((d) => mapPrompt(d.id, d.data() as Record<string, unknown>))
    .filter((p): p is AiSystemPrompt => p !== null)
    .filter((p) => (kind ? p.kind === kind : true))

  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind.localeCompare(b.kind)
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
  return items
}

export async function fetchAiSystemPromptById(
  id: string
): Promise<AiSystemPrompt | null> {
  const snap = await getAdminDb()
    .collection(AI_SYSTEM_PROMPTS_COLLECTION)
    .doc(id)
    .get()
  if (!snap.exists) return null
  return mapPrompt(snap.id, snap.data() as Record<string, unknown>)
}

export async function createAiSystemPrompt(
  input: AiSystemPromptInput
): Promise<string> {
  if (!isAiSystemPromptKind(input.kind)) {
    throw new Error('Invalid prompt kind')
  }
  const name = input.name.trim()
  const systemPrompt = input.systemPrompt.trim()
  if (!name) throw new Error('Name is required')
  if (!systemPrompt) throw new Error('System prompt is required')

  const ref = await getAdminDb().collection(AI_SYSTEM_PROMPTS_COLLECTION).add({
    kind: input.kind,
    name,
    description: (input.description ?? '').trim(),
    systemPrompt,
    active: input.active !== false,
    sortOrder: Number(input.sortOrder ?? 0) || 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateAiSystemPrompt(
  id: string,
  input: Partial<AiSystemPromptInput>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (input.kind !== undefined) {
    if (!isAiSystemPromptKind(input.kind)) {
      throw new Error('Invalid prompt kind')
    }
    payload.kind = input.kind
  }
  if (input.name !== undefined) {
    const name = input.name.trim()
    if (!name) throw new Error('Name is required')
    payload.name = name
  }
  if (input.description !== undefined) {
    payload.description = input.description.trim()
  }
  if (input.systemPrompt !== undefined) {
    const systemPrompt = input.systemPrompt.trim()
    if (!systemPrompt) throw new Error('System prompt is required')
    payload.systemPrompt = systemPrompt
  }
  if (input.active !== undefined) payload.active = input.active
  if (input.sortOrder !== undefined) {
    payload.sortOrder = Number(input.sortOrder) || 0
  }

  await getAdminDb()
    .collection(AI_SYSTEM_PROMPTS_COLLECTION)
    .doc(id)
    .update(payload)
}

export async function deleteAiSystemPrompt(id: string): Promise<void> {
  await getAdminDb().collection(AI_SYSTEM_PROMPTS_COLLECTION).doc(id).delete()
}

/**
 * Seed default blog draft + image system prompts when the library is empty
 * (or when missing those kinds).
 */
export async function seedDefaultAiSystemPrompts(): Promise<{
  created: number
  skipped: number
}> {
  const existing = await fetchAiSystemPrompts()
  let created = 0
  let skipped = 0

  const defaults = [
    ...DEFAULT_BLOG_DRAFT_PROMPTS,
    ...DEFAULT_BLOG_IMAGE_PROMPTS,
  ]

  for (const [index, def] of defaults.entries()) {
    if (existing.some((t) => t.kind === def.kind && t.name === def.name)) {
      skipped += 1
      continue
    }
    await createAiSystemPrompt({
      ...def,
      active: true,
      sortOrder: index,
    })
    created += 1
  }

  return { created, skipped }
}
