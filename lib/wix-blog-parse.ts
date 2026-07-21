/**
 * Parse a Wix blog HTML page into fields our Blog CMS understands.
 * No cheerio — targeted extraction from known Wix data-hooks + meta tags.
 */

import type { BlogSection } from '@/lib/types'
import { inferCategoryForSlug } from '@/lib/wix-blog-category'

export type ParsedWixBlog = {
  title: string
  author: string
  date: string
  dateIso?: string
  readTime: string
  excerpt: string
  imageUrl: string
  category: string
  sections: BlogSection[]
  tags: string[]
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n)
      return Number.isFinite(code) ? String.fromCodePoint(code) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const code = Number.parseInt(h, 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : ''
    })
}

function collapseWs(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function metaContent(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    'i'
  )
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  )
  const m = html.match(re) || html.match(re2)
  return m?.[1] ? decodeEntities(m[1]) : ''
}

function hookText(html: string, hook: string): string {
  const re = new RegExp(
    `data-hook=["']${hook}["'][^>]*>([\\s\\S]*?)</(?:span|div|h1|h2|time|li)>`,
    'i'
  )
  const m = html.match(re)
  if (!m?.[1]) return ''
  return collapseWs(decodeEntities(m[1].replace(/<[^>]+>/g, '')))
}

function hookTitleAttr(html: string, hook: string): string {
  const re = new RegExp(
    `title=["']([^"']+)["'][^>]*data-hook=["']${hook}["']`,
    'i'
  )
  const re2 = new RegExp(
    `data-hook=["']${hook}["'][^>]*title=["']([^"']+)["']`,
    'i'
  )
  const m = html.match(re) || html.match(re2)
  return m?.[1] ? decodeEntities(m[1]) : ''
}

function extractJsonLdBlog(html: string): Record<string, unknown> | null {
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html))) {
    try {
      const raw = JSON.parse(match[1]) as unknown
      const candidates = Array.isArray(raw) ? raw : [raw]
      for (const c of candidates) {
        if (!c || typeof c !== 'object') continue
        const o = c as Record<string, unknown>
        const type = String(o['@type'] ?? '')
        if (/BlogPosting|Article/i.test(type)) return o
      }
    } catch {
      // ignore bad JSON-LD blocks
    }
  }
  return null
}

function formatDisplayDate(isoOrDisplay: string): string {
  const trimmed = isoOrDisplay.trim()
  if (!trimmed) return ''
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime())) {
    // Already a display string like "Jul 2, 2025"
    try {
      const parsed = Date.parse(trimmed)
      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString('en-NZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
    } catch {
      return trimmed
    }
    return trimmed
  }
  return d.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Prefer a larger Wix static media URL for hero download.
 * Returns candidate URLs in preference order (caller tries until one works).
 */
export function wixImageCandidates(url: string): string[] {
  if (!url) return []
  const out: string[] = []
  const add = (u: string) => {
    if (u && !out.includes(u)) out.push(u)
  }
  try {
    const u = new URL(url)
    add(url)
    if (!u.hostname.includes('wixstatic.com')) return out
    const mediaMatch = u.pathname.match(/^\/media\/([^/]+)/)
    if (!mediaMatch) return out
    const file = mediaMatch[1]
    const bare = `https://static.wixstatic.com/media/${file}`
    add(
      `https://static.wixstatic.com/media/${file}/v1/fill/w_1600,h_900,al_c,q_85,enc_auto/${file}`
    )
    add(
      `https://static.wixstatic.com/media/${file}/v1/fill/w_1200,h_630,al_c,q_85/${file}`
    )
    add(bare)
    return out
  } catch {
    return url ? [url] : []
  }
}

export function upgradeWixImageUrl(url: string): string {
  return wixImageCandidates(url)[0] || ''
}

function extractHeroImage(html: string, ld: Record<string, unknown> | null): string {
  const og = metaContent(html, 'og:image')
  if (og) return og

  if (ld?.image) {
    if (typeof ld.image === 'string') return ld.image
    if (typeof ld.image === 'object' && ld.image) {
      const url = String((ld.image as { url?: string }).url ?? '')
      if (url) return url
    }
  }

  const hero = html.match(
    /data-hook=["']post-hero-image["'][\s\S]{0,2500}?(?:src|srcset)=["']([^"'\s]+)/i
  )
  if (hero?.[1]) return decodeEntities(hero[1].split(' ')[0])

  // Inline first content image as last resort
  const inline = html.match(
    /data-hook=["']post-description["'][\s\S]{0,8000}?src=["'](https:\/\/static\.wixstatic\.com\/media\/[^"']+)["']/i
  )
  if (inline?.[1]) return decodeEntities(inline[1])

  return ''
}

function extractPostDescriptionHtml(html: string): string {
  const marker = 'data-hook="post-description"'
  const start = html.indexOf(marker)
  if (start < 0) {
    const alt = html.indexOf("data-hook='post-description'")
    if (alt < 0) return ''
    return sliceDescription(html, alt)
  }
  return sliceDescription(html, start)
}

function sliceDescription(html: string, start: number): string {
  const open = html.indexOf('>', start)
  if (open < 0) return ''
  const endCandidates = [
    html.indexOf('data-hook="post-footer"', open),
    html.indexOf("data-hook='post-footer'", open),
    html.indexOf('data-hook="post-main-actions', open),
    html.indexOf('>Comments<', open),
  ].filter((i) => i > open)
  const end = endCandidates.length ? Math.min(...endCandidates) : open + 200_000
  return html.slice(open + 1, Math.min(end, html.length))
}

/**
 * Convert inline HTML to plain CMS text.
 * External links → label only; internal `/…` → [label](/path).
 */
function inlineToCmsText(fragment: string): string {
  let s = fragment
  // Drop images / svgs entirely
  s = s.replace(/<(?:img|svg|picture|figure)\b[\s\S]*?(?:\/>|<\/(?:img|svg|picture|figure)>)/gi, '')
  // Links
  s = s.replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_full, href: string, inner: string) => {
      const label = collapseWs(decodeEntities(inner.replace(/<[^>]+>/g, '')))
      if (!label) return ''
      const h = decodeEntities(href).trim()
      if (h.startsWith('/') || h.startsWith('#')) {
        return `[${label}](${h})`
      }
      // External — ignore href, keep label
      return label
    }
  )
  // Line breaks
  s = s.replace(/<br\s*\/?>/gi, ' ')
  s = s.replace(/<[^>]+>/g, '')
  return collapseWs(decodeEntities(s))
}

function extractListItems(ulHtml: string): string[] {
  const items: string[] = []
  const re = /<li\b[^>]*>([\s\S]*?)<\/li>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(ulHtml))) {
    const text = inlineToCmsText(m[1])
    if (text) items.push(text)
  }
  return items
}

export function htmlBodyToSections(descriptionHtml: string): BlogSection[] {
  const sections: BlogSection[] = []
  // Walk top-level-ish blocks in document order
  const re =
    /<(h[1-6]|p|ul|ol)\b([^>]*)>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null
  let introUsed = false

  while ((m = re.exec(descriptionHtml))) {
    const tag = m[1].toLowerCase()
    const inner = m[3]

    if (tag === 'ul' || tag === 'ol') {
      const items = extractListItems(m[0])
      if (items.length) sections.push({ type: 'ul', items })
      continue
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1))
      const heading = inlineToCmsText(inner)
      if (!heading) continue
      // Skip duplicate page title if it appears as h1 inside body
      if (level === 1 && sections.length === 0) continue
      sections.push({
        type: level <= 2 ? 'h2' : 'h3',
        heading,
      })
      continue
    }

    // paragraph
    const text = inlineToCmsText(inner)
    if (!text) continue
    // Skip chrome that sometimes leaks
    if (/^(write a comment|comments|top of page|bottom of page)$/i.test(text)) {
      continue
    }

    if (!introUsed && sections.length === 0) {
      sections.push({ type: 'intro', text })
      introUsed = true
    } else {
      sections.push({ type: 'p', text })
    }
  }

  return sections
}

function resolveCategory(title: string, slug: string, tags: string[]): string {
  for (const tag of tags) {
    const t = tag.trim()
    if (t) {
      // Prefer a real Wix tag if present
      return t.length > 40 ? t.slice(0, 40) : t
    }
  }
  return inferCategoryForSlug(slug, title)
}

function extractTags(html: string): string[] {
  const tags = new Set<string>()
  // Hashtag-style links sometimes present
  const hashRe =
    /data-hook=["']hashtag[^"']*["'][^>]*>([\s\S]*?)<\//gi
  let m: RegExpExecArray | null
  while ((m = hashRe.exec(html))) {
    const t = collapseWs(decodeEntities(m[1].replace(/<[^>]+>/g, '')))
    if (t) tags.add(t.replace(/^#/, ''))
  }
  // category label links under /blog/categories/
  const catRe =
    /href=["'][^"']*\/(?:blog\/)?categor(?:y|ies)\/([^"'/?#]+)["'][^>]*>([\s\S]*?)<\//gi
  while ((m = catRe.exec(html))) {
    const label = collapseWs(decodeEntities(m[2].replace(/<[^>]+>/g, '')))
    if (label) tags.add(label)
    else if (m[1]) tags.add(decodeURIComponent(m[1]).replace(/-/g, ' '))
  }
  return [...tags]
}

function estimateReadTime(sections: BlogSection[]): string {
  let words = 0
  for (const s of sections) {
    if (s.text) words += s.text.split(/\s+/).filter(Boolean).length
    if (s.heading) words += s.heading.split(/\s+/).filter(Boolean).length
    if (s.items) {
      for (const item of s.items) {
        words += item.split(/\s+/).filter(Boolean).length
      }
    }
  }
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export function parseWixBlogHtml(
  html: string,
  options?: { slug?: string }
): ParsedWixBlog {
  const ld = extractJsonLdBlog(html)
  const title =
    hookText(html, 'post-title') ||
    String(ld?.headline ?? '') ||
    metaContent(html, 'og:title') ||
    'Untitled'

  const author =
    hookText(html, 'user-name') ||
    (ld?.author && typeof ld.author === 'object'
      ? String((ld.author as { name?: string }).name ?? '')
      : '') ||
    metaContent(html, 'article:author') ||
    'Mike'

  const publishedIso =
    metaContent(html, 'article:published_time') ||
    String(ld?.datePublished ?? '') ||
    ''
  const timeAgoTitle = hookTitleAttr(html, 'time-ago')
  const date = formatDisplayDate(publishedIso || timeAgoTitle)

  const readFromHook =
    hookText(html, 'time-to-read') || hookTitleAttr(html, 'time-to-read')

  const excerpt = collapseWs(
    decodeEntities(
      String(ld?.description ?? '') || metaContent(html, 'og:description') || ''
    )
  ).slice(0, 400)

  const imageUrl = extractHeroImage(html, ld)
  const tags = extractTags(html)
  const descriptionHtml = extractPostDescriptionHtml(html)
  const sections = htmlBodyToSections(descriptionHtml)
  const category = resolveCategory(title, options?.slug ?? '', tags)
  const readTime =
    readFromHook ||
    (sections.length ? estimateReadTime(sections) : '5 min read')

  return {
    title: collapseWs(title),
    author: collapseWs(author) || 'Mike',
    date: date || formatDisplayDate(new Date().toISOString()),
    dateIso: publishedIso || undefined,
    readTime: collapseWs(readTime) || '5 min read',
    excerpt: excerpt,
    imageUrl,
    category,
    sections,
    tags,
  }
}
