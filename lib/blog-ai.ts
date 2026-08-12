import 'server-only'
import { requireOpenAIClient } from '@/lib/openai'
import {
  estimateReadTimeFromSections,
  markdownToBlogSections,
  slugifyBlogTitle,
} from '@/lib/blog-markdown'
import type { BlogAiDraft } from '@/lib/blog-ai-types'

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
- imagePrompt should describe a simple professional abstract blog hero for a fast mobile web page (no text in image; not high-resolution).
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

export async function generateBlogImage(options: {
  title: string
  systemPrompt: string
  imagePrompt?: string
  brief?: string
  userPrompt?: string
}): Promise<BlogAiImageResult> {
  const title = options.title.trim()
  if (!title) throw new Error('Title is required')

  const openai = requireOpenAIClient()
  const style = options.systemPrompt.trim()
  const subject =
    options.imagePrompt?.trim() ||
    options.userPrompt?.trim() ||
    options.brief?.trim() ||
    'Business systems, spreadsheets, and practical automation.'

  const promptParts = [
    style ||
      'Create a wide website blog hero image (abstract, professional) for XLS Experts New Zealand. Style: clean corporate, soft forest-green accents, light neutrals. No readable text, no logos, no photorealistic faces.',
    'This is a small web hero only — simple graphic suitable for a fast mobile blog card, not a high-resolution print or marketing billboard.',
    `Blog title context: ${title}.`,
    subject,
  ]
    .filter(Boolean)
    .join(' ')

  let rawBase64: string
  let revisedPrompt: string | undefined

  try {
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: promptParts,
      // Smallest landscape size the model supports; we compress further below.
      size: '1536x1024',
      quality: 'low',
      output_format: 'webp',
      output_compression: 60,
    })

    const first = result.data?.[0]
    const b64 = first?.b64_json
    if (!b64) {
      throw new Error('OpenAI gpt-image-1 returned no image data')
    }
    rawBase64 = b64
    revisedPrompt =
      first && 'revised_prompt' in first
        ? String((first as { revised_prompt?: string }).revised_prompt ?? '')
        : undefined
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
    rawBase64 = b64
    revisedPrompt = first?.revised_prompt
  }

  const { compressBlogImageBuffer } = await import('@/lib/blog-image-compress')
  const compressed = await compressBlogImageBuffer(Buffer.from(rawBase64, 'base64'), {
    baseName: 'blog-ai-hero',
  })

  return {
    imageBase64: compressed.bytes.toString('base64'),
    mimeType: compressed.contentType,
    revisedPrompt,
    width: compressed.width,
    height: compressed.height,
    originalBytes: compressed.originalBytes,
    optimizedBytes: compressed.bytes.byteLength,
  }
}
