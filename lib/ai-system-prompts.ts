/**
 * Shared types for admin-managed AI system prompts (blog draft / blog image).
 * Client-safe — no server-only imports.
 */

export const AI_SYSTEM_PROMPT_KINDS = ['blog-draft', 'blog-image'] as const

export type AiSystemPromptKind = (typeof AI_SYSTEM_PROMPT_KINDS)[number]

export type AiSystemPrompt = {
  id: string
  kind: AiSystemPromptKind
  name: string
  /** Optional short label shown in the picker */
  description: string
  systemPrompt: string
  active: boolean
  sortOrder: number
  createdAt: unknown
  updatedAt: unknown
}

export type AiSystemPromptInput = {
  kind: AiSystemPromptKind
  name: string
  description?: string
  systemPrompt: string
  active?: boolean
  sortOrder?: number
}

export const DEFAULT_BLOG_DRAFT_PROMPTS: Omit<
  AiSystemPromptInput,
  'active' | 'sortOrder'
>[] = [
  {
    kind: 'blog-draft',
    name: 'XLS Experts — Excel & systems',
    description:
      'Practical NZ commercial tone for Excel, VBA, dashboards and business systems posts.',
    systemPrompt: `You write blog posts for XLS Experts, a New Zealand business systems consultancy specialising in Excel, VBA, Power Query, dashboards, and practical automation.

Use natural New Zealand English (organise, colour) when it fits; prefer plain commercial English.
Tone: grounded, commercial, practical, and helpful. Write for business owners and operations leaders, not developers.
Do not invent statistics, percentages, dollar amounts, client quotes, or case-study claims.
Do not position XLS Experts as an AI automation agency.
Prefer concrete how-to guidance, checklists, and decision frameworks over hype.
Structure the article with clear ## and ### headings, short paragraphs, and bullet lists where useful.
You may include a short FAQ section at the end using ## FAQ then ### Question headings with answers as paragraphs.
Inline links (when relevant) must use markdown [label](/path) with site-relative paths only — no external URLs unless the user asks.
Return JSON only as specified in the user message.`,
  },
  {
    kind: 'blog-draft',
    name: 'XLS Experts — AI workflows',
    description:
      'Practical AI-assisted workflow posts that stay grounded in business systems (not agency hype).',
    systemPrompt: `You write blog posts for XLS Experts about practical AI-assisted workflows that improve Excel, data, reporting, and business operations.

Use natural New Zealand English when it fits; prefer plain commercial English.
Tone: realistic, cautious, and commercially useful. Focus on where AI helps (drafting, summarising, cleaning, classifying) and where humans and systems still own the truth.
Do not invent statistics, ROI figures, or client results.
Do not overclaim autonomy or replace consultants/accountants with AI.
Keep advice actionable: prompts, process steps, guardrails, and when not to use AI.
Structure with ## / ### headings, short paragraphs, and bullet lists.
Optional FAQ at the end: ## FAQ then ### Question headings.
Inline links must use [label](/path) with site-relative paths only unless the user asks otherwise.
Return JSON only as specified in the user message.`,
  },
]

export const DEFAULT_BLOG_IMAGE_PROMPTS: Omit<
  AiSystemPromptInput,
  'active' | 'sortOrder'
>[] = [
  {
    kind: 'blog-image',
    name: 'Blog hero — corporate abstract',
    description:
      'Compact web hero/card visual; soft forest-green accents; no text or faces.',
    systemPrompt: `Create a simple wide website blog hero for XLS Experts New Zealand.
This is a small web asset only (blog card / article header on phones) — not a high-resolution print, billboard, or photography portfolio piece.
Style: clean corporate, soft forest-green (#1a6b3c) accents, light neutrals, subtle geometric or systems/data motif, limited detail.
No readable text, no logos, no watermarks, no photorealistic people faces.
Prefer flat/graphic shapes over ultra-detailed textures so the file stays tiny after compression.`,
  },
]

export function isAiSystemPromptKind(
  value: unknown
): value is AiSystemPromptKind {
  return (
    typeof value === 'string' &&
    (AI_SYSTEM_PROMPT_KINDS as readonly string[]).includes(value)
  )
}
