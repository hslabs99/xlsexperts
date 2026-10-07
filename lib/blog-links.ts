/**
 * Undirected blog-to-blog footnote links.
 * A confirmed pair is two-way: each post lists the other under
 * "See other blogs of interest". Suggestions stay inactive until confirmed.
 */

export type BlogLinkPair = {
  a: string
  b: string
}

export type BlogLinkGraph = {
  links: BlogLinkPair[]
  suggestions: BlogLinkPair[]
}

export const EMPTY_BLOG_LINK_GRAPH: BlogLinkGraph = {
  links: [],
  suggestions: [],
}

export function blogLinkKey(a: string, b: string): string {
  const left = a.trim()
  const right = b.trim()
  return left < right ? `${left}\0${right}` : `${right}\0${left}`
}

export function normalizeBlogLinkPair(
  a: string,
  b: string
): BlogLinkPair | null {
  const left = a.trim()
  const right = b.trim()
  if (!left || !right || left === right) return null
  return left < right ? { a: left, b: right } : { a: right, b: left }
}

function readPairs(raw: unknown): BlogLinkPair[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const pairs: BlogLinkPair[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const pair = normalizeBlogLinkPair(String(row.a ?? ''), String(row.b ?? ''))
    if (!pair) continue
    const key = blogLinkKey(pair.a, pair.b)
    if (seen.has(key)) continue
    seen.add(key)
    pairs.push(pair)
  }
  return pairs
}

export function normalizeBlogLinkGraph(raw: unknown): BlogLinkGraph {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const links = readPairs(source.links)
  const confirmed = new Set(links.map((pair) => blogLinkKey(pair.a, pair.b)))
  const suggestions = readPairs(source.suggestions).filter(
    (pair) => !confirmed.has(blogLinkKey(pair.a, pair.b))
  )
  return { links, suggestions }
}

export function otherSlug(pair: BlogLinkPair, slug: string): string | null {
  if (pair.a === slug) return pair.b
  if (pair.b === slug) return pair.a
  return null
}

export function linkedSlugs(graph: BlogLinkGraph, slug: string): string[] {
  const found: string[] = []
  for (const pair of graph.links) {
    const other = otherSlug(pair, slug)
    if (other) found.push(other)
  }
  return found
}

const STOP = new Set([
  'a', 'an', 'and', 'the', 'for', 'with', 'your', 'you', 'our', 'from', 'into',
  'that', 'this', 'how', 'what', 'when', 'who', 'why', 'are', 'is', 'to', 'of',
  'in', 'on', 'or', 'by', 'as', 'at', 'be', 'it', 'we', 'can', 'not', 'new',
  'blog', 'guide',
])

/** Generic spreadsheet words. Shared hits here do not suggest a real link. */
const LINK_SCORE_EXCLUSIONS = new Set([
  'excel',
  'xls',
  'xlsx',
  'xlsm',
  'xlsb',
  'experts',
  'vba',
  'macro',
  'macros',
  'workbook',
  'workbooks',
  'worksheet',
  'worksheets',
  'spreadsheet',
  'spreadsheets',
  'formula',
  'formulas',
  'cell',
  'cells',
  'column',
  'columns',
  'row',
  'rows',
  'sheet',
  'sheets',
  'microsoft',
  'office',
])

/** A word that appears in both titles. */
const TITLE_MATCH_WEIGHT = 3
/** A word shared only in the excerpt or category. */
const OTHER_MATCH_WEIGHT = 1

function tokens(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (word) =>
        word.length > 2 && !STOP.has(word) && !LINK_SCORE_EXCLUSIONS.has(word)
    )
  return new Set(words)
}

export type BlogLinkSuggestSource = {
  slug: string
  title: string
  excerpt?: string
  category?: string
}

function scoreBlogLinkPair(
  source: BlogLinkSuggestSource,
  other: BlogLinkSuggestSource
): number {
  const sourceTitle = tokens(source.title)
  const otherTitle = tokens(other.title)
  const sourceOther = tokens(`${source.category ?? ''} ${source.excerpt ?? ''}`)
  const otherOther = tokens(`${other.category ?? ''} ${other.excerpt ?? ''}`)
  const shared = new Set<string>()
  for (const word of [...sourceTitle, ...sourceOther]) {
    if (otherTitle.has(word) || otherOther.has(word)) shared.add(word)
  }
  let score = 0
  for (const word of shared) {
    score +=
      sourceTitle.has(word) && otherTitle.has(word)
        ? TITLE_MATCH_WEIGHT
        : OTHER_MATCH_WEIGHT
  }
  return score
}

/** Other posts ranked by weighted word overlap. Highest score first. */
export function rankBlogLinkCandidates(
  source: BlogLinkSuggestSource,
  posts: readonly BlogLinkSuggestSource[]
): { slug: string; score: number }[] {
  return posts
    .filter((post) => post.slug && post.slug !== source.slug)
    .map((post) => ({ slug: post.slug, score: scoreBlogLinkPair(source, post) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
}

/** Keyword overlap pairs that are not already confirmed or suggested. */
export function suggestBlogLinks(
  posts: readonly BlogLinkSuggestSource[],
  graph: BlogLinkGraph,
  perPost = 3
): BlogLinkPair[] {
  const taken = new Set([
    ...graph.links.map((pair) => blogLinkKey(pair.a, pair.b)),
    ...graph.suggestions.map((pair) => blogLinkKey(pair.a, pair.b)),
  ])
  const bags = posts.map((post) => ({
    slug: post.slug,
    words: tokens(`${post.title} ${post.category ?? ''} ${post.excerpt ?? ''}`),
  }))
  const scored: { pair: BlogLinkPair; score: number }[] = []
  for (let i = 0; i < bags.length; i += 1) {
    const left = bags[i]
    if (!left) continue
    const row: { pair: BlogLinkPair; score: number }[] = []
    for (let j = i + 1; j < bags.length; j += 1) {
      const right = bags[j]
      if (!right) continue
      const pair = normalizeBlogLinkPair(left.slug, right.slug)
      if (!pair || taken.has(blogLinkKey(pair.a, pair.b))) continue
      let score = 0
      for (const word of left.words) {
        if (right.words.has(word)) score += 1
      }
      if (score >= 2) row.push({ pair, score })
    }
    row.sort((a, b) => b.score - a.score)
    scored.push(...row.slice(0, perPost))
  }
  const seen = new Set<string>()
  const next: BlogLinkPair[] = []
  scored
    .sort((a, b) => b.score - a.score)
    .forEach((item) => {
      const key = blogLinkKey(item.pair.a, item.pair.b)
      if (seen.has(key)) return
      seen.add(key)
      next.push(item.pair)
    })
  return next.slice(0, 40)
}
