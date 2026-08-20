import 'server-only'
import { requireOpenAIClient } from '@/lib/openai'
import {
  estimateReadTimeFromSections,
  markdownToBlogSections,
  slugifyBlogTitle,
} from '@/lib/blog-markdown'
import type { BlogAiDraft } from '@/lib/blog-ai-types'
import { buildBlogAiImagePrompt } from '@/lib/blog-ai-image-styles'

export type { BlogAiDraft } from '@/lib/blog-ai-types'

export type BlogAiDraftInput = {
  title: string
  brief: string
  userPrompt: string
  systemPrompt: string
  categoryHint?: string
  authorHint?: string
}

const RESPONSE_SHAPE = `{
  "title": string,
  "slug": string,
  "excerpt": string,
  "category": string,
  "author": string,
  "readTime": string,
  "markdown": string,
  "imagePrompt": string
}`

export async function generateBlogDraft(
  input: BlogAiDraftInput
): Promise<BlogAiDraft> {
  const title = input.title.trim()
  const brief = input.brief.trim()
  const userPrompt = input.userPrompt.trim()
  const systemPrompt = input.systemPrompt.trim()

  if (!title) throw new Error('Title is required')
  if (!brief && !userPrompt) {
    throw new Error('Brief description or user prompt is required')
  }
  if (!systemPrompt) throw new Error('System prompt is required')

  const openai = requireOpenAIClient()

  const user = `Working title: ${title}
${input.categoryHint?.trim() ? `Category hint: ${input.categoryHint.trim()}\n` : ''}${input.authorHint?.trim() ? `Author hint: ${input.authorHint.trim()}\n` : ''}Brief description:
${brief || '(none)'}

User prompt / angle:
${userPrompt || '(none)'}

Write a complete blog post body in markdown (field "markdown").
Rules for markdown:
- Do not repeat the title as a # heading (title is stored separately).
- Start with an opening paragraph (no heading).
- Use ## for main sections and ### for subsections.
- Use bullet lists with "- " where helpful.
- Optional FAQ: a "## FAQ" section with "### Question" headings and paragraph answers.
- Keep excerpt to 1–2 sentences for the blog card.
- slug must be lowercase kebab-case.
- imagePrompt should describe the subject and scene for a blog hero (setting, objects, people if relevant). Do not specify infographic vs photograph vs illustration — visual style is chosen separately. No readable text or logos in the image; not high-resolution.
- readTime like "6 min read".
- category should be a short topic tag (e.g. Excel, Dashboards, A.I. Solutions).

Respond with JSON matching:
${RESPONSE_SHAPE}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.45,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: user },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned an empty blog draft')

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new Error('OpenAI returned invalid JSON for the blog draft')
  }

  const draftTitle = String(parsed.title ?? title).trim() || title
  const markdown = String(parsed.markdown ?? '').trim()
  if (!markdown) throw new Error('OpenAI returned an empty markdown body')

  const sections = markdownToBlogSections(markdown)
  const readTime =
    String(parsed.readTime ?? '').trim() ||
    estimateReadTimeFromSections(sections)

  return {
    title: draftTitle,
    slug:
      slugifyBlogTitle(String(parsed.slug ?? '')) ||
      slugifyBlogTitle(draftTitle) ||
      'untitled-post',
    excerpt: String(parsed.excerpt ?? brief).trim(),
    category:
      String(parsed.category ?? input.categoryHint ?? '').trim() || 'Guides',
    author: String(parsed.author ?? input.authorHint ?? 'Mike').trim() || 'Mike',
    readTime,
    markdown,
    sections,
    imagePrompt: String(parsed.imagePrompt ?? '').trim(),
  }
}

export type BlogAiImageResult = {
  imageBase64: string
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png'
  revisedPrompt?: string
  width?: number | null
  height?: number | null
  originalBytes?: number
  optimizedBytes?: number
}

function openaiErrorText(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return error instanceof Error ? error.message : String(error)
  }
  const record = error as {
    message?: string
    error?: { message?: string; code?: string }
    code?: string
  }
  const nested = record.error?.message?.trim()
  if (nested) {
    const code = record.error?.code || record.code
    return code ? `${nested} (${code})` : nested
  }
  return record.message?.trim() || 'Unknown OpenAI error'
}

export async function generateBlogImage(options: {
  title: string
  systemPrompt: string
  imagePrompt?: string
  brief?: string
  userPrompt?: string
  imageStyle?: string
}): Promise<BlogAiImageResult> {
  const title = options.title.trim()
  if (!title) throw new Error('Title is required')

  const openai = requireOpenAIClient()
  const subject =
    options.imagePrompt?.trim() ||
    options.brief?.trim() ||
    'Business systems, spreadsheets, and practical automation.'

  const prompt = buildBlogAiImagePrompt({
    title,
    imageStyle: options.imageStyle,
    subject,
  })
  const compactPrompt = buildBlogAiImagePrompt({
    title,
    imageStyle: options.imageStyle,
    compact: true,
  })

  async function fromGptImage1(imagePrompt: string) {
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: imagePrompt,
      size: '1536x1024',
      quality: 'low',
      output_format: 'webp',
      output_compression: 60,
    })
    const first = result.data?.[0]
    const b64 = first?.b64_json
    if (!b64) throw new Error('OpenAI gpt-image-1 returned no image data')
    return {
      rawBase64: b64,
      revisedPrompt:
        first && 'revised_prompt' in first
          ? String((first as { revised_prompt?: string }).revised_prompt ?? '')
          : undefined,
    }
  }

  async function fromDalle3(imagePrompt: string) {
    const result = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt.slice(0, 3800),
      size: '1792x1024',
      quality: 'standard',
      response_format: 'b64_json',
      n: 1,
    })
    const first = result.data?.[0]
    const b64 = first?.b64_json
    if (!b64) throw new Error('OpenAI dall-e-3 returned no image data')
    return {
      rawBase64: b64,
      revisedPrompt: first?.revised_prompt,
    }
  }

  let rawBase64: string
  let revisedPrompt: string | undefined
  let mimeType: BlogAiImageResult['mimeType'] = 'image/webp'
  const errors: string[] = []

  try {
    const generated = await fromGptImage1(prompt)
    rawBase64 = generated.rawBase64
    revisedPrompt = generated.revisedPrompt
    mimeType = 'image/webp'
  } catch (primaryError) {
    errors.push(`gpt-image-1: ${openaiErrorText(primaryError)}`)
    try {
      const retry = await fromGptImage1(compactPrompt)
      rawBase64 = retry.rawBase64
      revisedPrompt = retry.revisedPrompt
      mimeType = 'image/webp'
    } catch (compactError) {
      errors.push(`gpt-image-1 compact: ${openaiErrorText(compactError)}`)
      try {
        const fallback = await fromDalle3(compactPrompt)
        rawBase64 = fallback.rawBase64
        revisedPrompt = fallback.revisedPrompt
        mimeType = 'image/png'
      } catch (dalleError) {
        errors.push(`dall-e-3: ${openaiErrorText(dalleError)}`)
        throw new Error(`Image generation failed. ${errors.join(' | ')}`)
      }
    }
  }

  // Do not import sharp here. Next/Turbopack bundles it as a native module
  // that fails on App Hosting (missing libvips). OpenAI already returns a
  // compressed webp; the editor also optimizes on save in the browser.
  const byteLength = Buffer.from(rawBase64, 'base64').byteLength
  return {
    imageBase64: rawBase64,
    mimeType,
    revisedPrompt,
    width: null,
    height: null,
    originalBytes: byteLength,
    optimizedBytes: byteLength,
  }
}
