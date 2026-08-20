/**
 * Built-in visual treatments for AI blog hero images.
 * Keep these short and descriptive — image models reject long
 * instruction/override prompts and stacked “do not” rules.
 */

export const BLOG_AI_IMAGE_STYLES = [
  {
    id: 'infographic',
    label: 'Infographic',
    description:
      'Clean diagram, process steps, or data visual — graphic, not a photo.',
    prompt:
      'Clean flat infographic of a business process or data workflow, simple geometric shapes, forest green and light grey, no people, not a photograph.',
  },
  {
    id: 'photo-office',
    label: 'Photo — office',
    description:
      'Realistic workplace: desk, laptop, screens — contemporary office, not a diagram.',
    prompt:
      'Photorealistic contemporary office: desk, laptop, natural light, professional workplace, not a diagram.',
  },
  {
    id: 'photo-collaboration',
    label: 'Photo — collaboration',
    description:
      'People working together around a laptop or whiteboard in an office.',
    prompt:
      'Photorealistic candid of colleagues collaborating around a laptop in a modern office, natural expressions, not looking at camera.',
  },
  {
    id: 'photo-factory',
    label: 'Photo — factory',
    description:
      'Manufacturing plant, production line, or workshop — industrial, not an office.',
    prompt:
      'Photorealistic manufacturing plant or workshop: production line, machinery, industrial lighting, people at work not posing.',
  },
  {
    id: 'photo-construction',
    label: 'Photo — construction',
    description:
      'Building site, plant, or civil works — hi-vis and structure, not a desk.',
    prompt:
      'Photorealistic construction site: scaffolding, steel, hi-vis, plans or a tablet, candid working atmosphere.',
  },
  {
    id: 'editorial',
    label: 'Editorial illustration',
    description:
      'Magazine-style illustrated scene — atmospheric, not a process diagram.',
    prompt:
      'Editorial magazine illustration of business systems and decision-making, painted digital style, forest green and warm neutrals, not a photo and not a process diagram.',
  },
] as const

export type BlogAiImageStyleId = (typeof BLOG_AI_IMAGE_STYLES)[number]['id']

export function isBlogAiImageStyleId(
  value: unknown
): value is BlogAiImageStyleId {
  return (
    typeof value === 'string' &&
    BLOG_AI_IMAGE_STYLES.some((style) => style.id === value)
  )
}

export function blogAiImageStylePrompt(id: unknown): string {
  if (!isBlogAiImageStyleId(id)) return ''
  const style = BLOG_AI_IMAGE_STYLES.find((item) => item.id === id)
  return style?.prompt ?? ''
}

export function blogAiImageStyleLabel(id: unknown): string {
  if (!isBlogAiImageStyleId(id)) return ''
  return BLOG_AI_IMAGE_STYLES.find((item) => item.id === id)?.label ?? ''
}

export const BLOG_AI_IMAGE_SHARED_CONSTRAINTS =
  'Wide landscape website blog hero. No readable text, logos, or watermarks.'

const META_SUBJECT_LINE =
  /describe the subject and setting only[. ]*visual style \(infographic, photo, or illustration\) is chosen separately\.?/i

export function shortenBlogImageSubject(
  text: string,
  maxChars = 280
): string {
  const cleaned = text.replace(META_SUBJECT_LINE, '').replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxChars) return cleaned
  return `${cleaned.slice(0, maxChars).trim()}…`
}

export function buildBlogAiImagePrompt(options: {
  title: string
  imageStyle?: string
  subject?: string
  libraryPrompt?: string
  compact?: boolean
}): string {
  const title = options.title.trim()
  const style = blogAiImageStylePrompt(options.imageStyle)
  const label = blogAiImageStyleLabel(options.imageStyle)
  const subject = shortenBlogImageSubject(options.subject ?? '')
  const brandHint = 'Soft forest-green and light neutrals when they fit.'

  if (options.compact) {
    return [
      label ? `${label} style.` : 'Professional website blog hero.',
      `Topic: ${title}.`,
      BLOG_AI_IMAGE_SHARED_CONSTRAINTS,
    ]
      .filter(Boolean)
      .join(' ')
  }

  return [
    style ||
      'Clean professional website blog hero, forest green and light neutrals.',
    brandHint,
    BLOG_AI_IMAGE_SHARED_CONSTRAINTS,
    `Topic: ${title}.`,
    subject && subject.toLowerCase() !== title.toLowerCase() ? subject : '',
  ]
    .filter(Boolean)
    .join(' ')
}
