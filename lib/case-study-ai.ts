import 'server-only'
import { requireOpenAIClient } from '@/lib/openai'
import { servicePages } from '@/lib/service-pages'
import { solutionPages } from '@/lib/solutions'
import type { CaseStudyAiDraft } from '@/lib/case-study-ai-types'

export type { CaseStudyAiDraft } from '@/lib/case-study-ai-types'

export type CaseStudyAiDraftInput = {
  client: string
  title: string
  brief: string
  sectorHint?: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const serviceCatalog = servicePages
  .map((s) => `- ${s.href.replace(/^\//, '')}: ${s.label}`)
  .join('\n')

const solutionCatalog = solutionPages
  .map((s) => `- ${s.slug}: ${s.title}`)
  .join('\n')

export async function generateCaseStudyDraft(
  input: CaseStudyAiDraftInput
): Promise<CaseStudyAiDraft> {
  const client = input.client.trim()
  const title = input.title.trim()
  const brief = input.brief.trim()
  if (!client || !title || !brief) {
    throw new Error('Client, project title and brief are required')
  }

  const openai = requireOpenAIClient()

  const system = `You write case-study copy for XLS Experts, a New Zealand business systems consultancy.
Use natural New Zealand English (organise, colour, etc. only if needed — prefer plain commercial English).
Tone: grounded, commercial, practical. Do not invent statistics, percentages, dollar amounts, or client quotes.
Do not claim AI automation agency positioning.
Keep problem/solution/outcome each to 1–3 sentences.
Tags should be short technology or capability labels (e.g. Excel, VBA, SQL DB).
Choose serviceSlugs and solutionSlugs only from the provided catalogues (0–4 each).
slug must be lowercase kebab-case.
imagePrompt should describe a professional, abstract business/systems visual suitable for a website card — no text in the image, no logos, no photorealistic faces, restrained greens and neutrals.
Return JSON only.`

  const user = `Client: ${client}
Project title: ${title}
${input.sectorHint?.trim() ? `Sector hint: ${input.sectorHint.trim()}\n` : ''}Brief:
${brief}

Service catalogue (use path without leading slash as serviceSlugs):
${serviceCatalog}

Solution catalogue (use these solutionSlugs):
${solutionCatalog}

Respond with JSON matching:
{
  "title": string,
  "client": string,
  "sector": string,
  "slug": string,
  "problem": string,
  "solution": string,
  "outcome": string,
  "tags": string[],
  "serviceSlugs": string[],
  "solutionSlugs": string[],
  "imagePrompt": string,
  "summary": string
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned an empty draft')

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new Error('OpenAI returned invalid JSON for the case-study draft')
  }

  const validServiceSlugs = new Set<string>(
    servicePages.map((s) => s.href.replace(/^\//, ''))
  )
  const validSolutionSlugs = new Set<string>(solutionPages.map((s) => s.slug))

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.map(String).map((t) => t.trim()).filter(Boolean)
      : []

  const draftTitle = String(parsed.title ?? title).trim() || title
  const draftClient = String(parsed.client ?? client).trim() || client
  const slug =
    slugify(String(parsed.slug ?? '')) ||
    slugify(`${draftClient}-${draftTitle}`)

  return {
    title: draftTitle,
    client: draftClient,
    sector: String(parsed.sector ?? input.sectorHint ?? '').trim() || 'Business',
    slug,
    problem: String(parsed.problem ?? '').trim(),
    solution: String(parsed.solution ?? '').trim(),
    outcome: String(parsed.outcome ?? '').trim(),
    tags: asStringArray(parsed.tags).slice(0, 8),
    serviceSlugs: asStringArray(parsed.serviceSlugs)
      .map((s) => s.replace(/^\//, ''))
      .filter((s) => validServiceSlugs.has(s))
      .slice(0, 4),
    solutionSlugs: asStringArray(parsed.solutionSlugs)
      .filter((s) => validSolutionSlugs.has(s))
      .slice(0, 4),
    imagePrompt: String(parsed.imagePrompt ?? '').trim(),
    summary: String(parsed.summary ?? '').trim(),
  }
}

export type CaseStudyAiImageResult = {
  /** PNG bytes as base64 (no data: prefix) */
  imageBase64: string
  mimeType: 'image/png'
  revisedPrompt?: string
}

export async function generateCaseStudyImage(options: {
  client: string
  title: string
  sector?: string
  imagePrompt?: string
  brief?: string
}): Promise<CaseStudyAiImageResult> {
  const openai = requireOpenAIClient()
  const promptParts = [
    'Create a wide website hero/card image (abstract, professional) for an XLS Experts New Zealand case study.',
    'Style: clean corporate, soft forest-green (#1a6b3c) accents, light neutrals, subtle geometric or systems/data motif.',
    'No readable text, no logos, no watermarks, no photorealistic people faces.',
    options.client ? `Client context: ${options.client}.` : '',
    options.title ? `Project: ${options.title}.` : '',
    options.sector ? `Sector: ${options.sector}.` : '',
    options.imagePrompt || options.brief || 'Business systems and spreadsheet modernisation.',
  ]
    .filter(Boolean)
    .join(' ')

  // Prefer gpt-image-1; fall back to dall-e-3 if the account lacks image model access.
  try {
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: promptParts,
      size: '1536x1024',
      quality: 'medium',
    })

    const first = result.data?.[0]
    const b64 = first?.b64_json
    if (!b64) {
      throw new Error('OpenAI gpt-image-1 returned no image data')
    }

    return {
      imageBase64: b64,
      mimeType: 'image/png',
      revisedPrompt:
        first && 'revised_prompt' in first
          ? String((first as { revised_prompt?: string }).revised_prompt ?? '')
          : undefined,
    }
  } catch (primaryError) {
    const fallback = await openai.images.generate({
      model: 'dall-e-3',
      prompt: promptParts.slice(0, 3800),
      size: '1792x1024',
      quality: 'standard',
      response_format: 'b64_json',
      n: 1,
    })

    const first = fallback.data?.[0]
    const b64 = first?.b64_json
    if (!b64) {
      const detail =
        primaryError instanceof Error ? primaryError.message : 'unknown error'
      throw new Error(
        `Image generation failed (gpt-image-1 and dall-e-3). Last error: ${detail}`
      )
    }

    return {
      imageBase64: b64,
      mimeType: 'image/png',
      revisedPrompt: first?.revised_prompt,
    }
  }
}
