import type { BlogAiDraft } from '@/lib/blog-ai-types'
import {
  isBlogAiImageStyleId,
  type BlogAiImageStyleId,
} from '@/lib/blog-ai-image-styles'
import { blogSectionsToMarkdown } from '@/lib/blog-markdown'
import type { BlogSection } from '@/lib/types'

export const BLOG_AI_ASSIST_SESSION_KEY = 'xls-blog-ai-assist-wip-v1'

export const EXISTING_BLOG_AI_USER_PROMPT =
  'This is an existing blog post, not a new article. Generate a matching hero image from the title, excerpt, category and body. Do not rewrite the copy unless the editor asks.'

export type BlogAiAssistExistingPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  readTime: string
  sections: BlogSection[]
}

export type BlogAiAssistSession = {
  title: string
  brief: string
  userPrompt: string
  categoryHint: string
  /** Empty string = new post; otherwise the editor slug this session belongs to. */
  sourceSlug: string
  draftPromptIds: string[]
  imagePromptIds: string[]
  /** Built-in visual treatment for Generate image. Empty until the editor picks one. */
  imageStyleId: BlogAiImageStyleId | ''
  draft: BlogAiDraft | null
  imageDataUrl: string | null
  imageMimeType: string | null
  imageFileName: string | null
  updatedAt: number
}

export function emptyBlogAiAssistSession(): BlogAiAssistSession {
  return {
    title: '',
    brief: '',
    userPrompt: '',
    categoryHint: '',
    sourceSlug: '',
    draftPromptIds: [],
    imagePromptIds: [],
    imageStyleId: '',
    draft: null,
    imageDataUrl: null,
    imageMimeType: null,
    imageFileName: null,
    updatedAt: Date.now(),
  }
}

export function existingBlogPostHasContent(
  post: BlogAiAssistExistingPost | null | undefined
): boolean {
  if (!post) return false
  return Boolean(
    post.title.trim() ||
      post.excerpt.trim() ||
      post.category.trim() ||
      post.sections.some(
        (s) =>
          Boolean(s.text?.trim()) ||
          Boolean(s.heading?.trim()) ||
          Boolean(s.items?.some((item) => item.trim())) ||
          Boolean(s.faqs?.length)
      )
  )
}

export function imagePromptFromExistingBlog(
  post: BlogAiAssistExistingPost
): string {
  const headings = post.sections
    .filter(
      (s) => (s.type === 'h2' || s.type === 'h3') && Boolean(s.heading?.trim())
    )
    .map((s) => s.heading!.trim())
    .slice(0, 8)
  const opening = post.sections.find(
    (s) => (s.type === 'intro' || s.type === 'p') && Boolean(s.text?.trim())
  )?.text?.trim()
  const excerpt = post.excerpt.trim()

  return [
    `Website blog hero for the article “${post.title.trim()}”.`,
    post.category.trim() ? `Category: ${post.category.trim()}.` : '',
    excerpt ? `Summary: ${excerpt}` : '',
    headings.length ? `Themes: ${headings.join('; ')}.` : '',
    opening && opening !== excerpt ? `Opening: ${opening.slice(0, 320)}` : '',
    'Describe the subject and setting only. Visual style (infographic, photo, or illustration) is chosen separately.',
  ]
    .filter(Boolean)
    .join(' ')
}

export function seedBlogAiAssistFromPost(
  post: BlogAiAssistExistingPost,
  opts?: { saved?: boolean }
): {
  title: string
  brief: string
  userPrompt: string
  categoryHint: string
  sourceSlug: string
  draft: BlogAiDraft
} {
  const markdown = blogSectionsToMarkdown(post.sections)
  const title = post.title.trim()
  const excerpt = post.excerpt.trim()
  return {
    title,
    brief: excerpt,
    userPrompt: opts?.saved
      ? EXISTING_BLOG_AI_USER_PROMPT
      : 'Continue from the details already in the editor. Generate a matching hero image from this post.',
    categoryHint: post.category.trim(),
    sourceSlug: post.slug.trim(),
    draft: {
      title: title || 'Untitled post',
      slug: post.slug.trim(),
      excerpt,
      category: post.category.trim() || 'Guides',
      author: post.author.trim() || 'Mike',
      readTime: post.readTime.trim() || '5 min read',
      markdown,
      sections: post.sections.map((s) => ({ ...s })),
      imagePrompt: imagePromptFromExistingBlog(post),
    },
  }
}

export function loadBlogAiAssistSession(): BlogAiAssistSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(BLOG_AI_ASSIST_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BlogAiAssistSession>
    return {
      ...emptyBlogAiAssistSession(),
      ...parsed,
      draftPromptIds: Array.isArray(parsed.draftPromptIds)
        ? parsed.draftPromptIds.filter((id): id is string => typeof id === 'string')
        : [],
      imagePromptIds: Array.isArray(parsed.imagePromptIds)
        ? parsed.imagePromptIds.filter((id): id is string => typeof id === 'string')
        : typeof (parsed as { imagePromptId?: string }).imagePromptId ===
            'string' && (parsed as { imagePromptId?: string }).imagePromptId
          ? [(parsed as { imagePromptId: string }).imagePromptId]
          : [],
      imageStyleId: isBlogAiImageStyleId(parsed.imageStyleId)
        ? parsed.imageStyleId
        : '',
      sourceSlug:
        typeof parsed.sourceSlug === 'string' ? parsed.sourceSlug : '',
      draft: parsed.draft ?? null,
      imageDataUrl:
        typeof parsed.imageDataUrl === 'string' ? parsed.imageDataUrl : null,
      imageMimeType:
        typeof parsed.imageMimeType === 'string' ? parsed.imageMimeType : null,
      imageFileName:
        typeof parsed.imageFileName === 'string' ? parsed.imageFileName : null,
      updatedAt:
        typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function saveBlogAiAssistSession(session: BlogAiAssistSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      BLOG_AI_ASSIST_SESSION_KEY,
      JSON.stringify({ ...session, updatedAt: Date.now() })
    )
  } catch {
    // Quota / private mode — ignore; in-memory state still works for the session.
  }
}

export function clearBlogAiAssistSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(BLOG_AI_ASSIST_SESSION_KEY)
  } catch {
    // ignore
  }
}

export function blogAiAssistSessionHasWork(
  session: BlogAiAssistSession | null
): boolean {
  if (!session) return false
  return Boolean(
    session.title.trim() ||
      session.brief.trim() ||
      session.userPrompt.trim() ||
      session.categoryHint.trim() ||
      session.draft ||
      session.imageDataUrl
  )
}

export function dataUrlToFile(
  dataUrl: string,
  fileName: string,
  mimeType?: string | null
): File | null {
  try {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl)
    if (!match) return null
    const mime = mimeType || match[1] || 'image/png'
    const binary = atob(match[2])
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new File([bytes], fileName || 'blog-ai-image.png', { type: mime })
  } catch {
    return null
  }
}

/** Join multiple library prompts into one system message for OpenAI. */
export function combineSystemPrompts(
  prompts: Array<{ name: string; systemPrompt: string }>
): string {
  const parts = prompts
    .map((p) => ({
      name: p.name.trim(),
      systemPrompt: p.systemPrompt.trim(),
    }))
    .filter((p) => p.systemPrompt)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].systemPrompt
  return parts
    .map(
      (p, i) =>
        `### System prompt ${i + 1}${p.name ? `: ${p.name}` : ''}\n${p.systemPrompt}`
    )
    .join('\n\n')
}
