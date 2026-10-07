/**
 * Editable prompt for the blog Google-listing generator.
 * Client-safe. Stored in Site Content / blog-serp-prompt.
 *
 * Placeholders filled per post: {{title}} {{category}} {{excerpt}} {{body}}
 */

export const BLOG_SERP_PROMPT_PLACEHOLDERS = [
  '{{title}}',
  '{{category}}',
  '{{excerpt}}',
  '{{body}}',
] as const

export const DEFAULT_BLOG_SERP_PROMPT = `You write Google search titles and descriptions for XLS Experts, an Excel consulting firm.

Return JSON only, with this shape:
{
  "nz": { "title": string, "description": string },
  "intl": { "title": string, "description": string },
  "uk": { "title": string, "description": string }
}

LENGTH — count every character, including spaces and punctuation, before you answer. If a field is outside its range, rewrite that field until it fits. Do not return a short description.

- title: 40 to 46 characters. Do not include " | XLS Experts". The site adds that suffix afterwards.
- description: 148 to 155 characters. 140 is the hard minimum and 155 is the hard maximum. Under 140 is a failed answer. If one sentence is too short, add a second sentence about the practical outcome in the article. The region code counts toward the total.

REGIONS — each listing is its own wording, not one sentence with the region swapped.
- nz: the title and the description must each contain the standalone word NZ. New Zealand English.
- intl: the title and the description must each contain the standalone word US. American spelling when those words appear (modeling, organization).
- uk: the title and the description must each contain the standalone word UK.

Do not write "New Zealand", "United Kingdom", or "United States".
Stay faithful to the article. Do not invent services, statistics, prices, or client results.

Article title: {{title}}
Category: {{category}}
Excerpt: {{excerpt}}

Article text:
{{body}}`

export function normalizeBlogSerpPrompt(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || DEFAULT_BLOG_SERP_PROMPT
}

export function fillBlogSerpPrompt(
  template: string,
  input: {
    title: string
    category?: string
    excerpt?: string
    body?: string
  }
): string {
  const filled = normalizeBlogSerpPrompt(template)
    .replaceAll('{{title}}', input.title.trim() || '(none)')
    .replaceAll('{{category}}', input.category?.trim() || '(none)')
    .replaceAll('{{excerpt}}', input.excerpt?.trim() || '(none)')
    .replaceAll('{{body}}', (input.body ?? '').trim().slice(0, 6000) || '(none)')

  const missingArticle =
    !template.includes('{{title}}') && !template.includes('{{body}}')
  if (!missingArticle) return filled

  return `${filled}

Article title: ${input.title.trim() || '(none)'}
Category: ${input.category?.trim() || '(none)'}
Excerpt: ${input.excerpt?.trim() || '(none)'}

Article text:
${(input.body ?? '').trim().slice(0, 6000) || '(none)'}`
}
