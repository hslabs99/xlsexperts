import { servicePages } from '@/lib/service-pages'

export type BlogLinkTarget = {
  label: string
  href: string
}

/** Site pages an admin can hyperlink to from blog body text. */
export const BLOG_SITE_PAGES: readonly BlogLinkTarget[] = [
  { label: 'Home page', href: '/' },
  { label: 'All services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Excel in Enterprise Operational Applications',
    href: '/enterprise',
  },
  ...servicePages.map((p) => ({ label: p.label, href: p.href })),
]

/** Home-page section bookmarks (use from any page, including blog). */
export const BLOG_HOME_SECTIONS: readonly BlogLinkTarget[] = [
  { label: 'Services', href: '/#services' },
  { label: 'How We Work', href: '/#how-we-work' },
  { label: 'Case Studies', href: '/#case-studies' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export const ALL_BLOG_LINK_TARGETS: readonly BlogLinkTarget[] = [
  ...BLOG_SITE_PAGES,
  ...BLOG_HOME_SECTIONS,
]

export function findBlogLinkTarget(href: string): BlogLinkTarget | undefined {
  return ALL_BLOG_LINK_TARGETS.find((t) => t.href === href)
}

export function buildMarkdownLink(label: string, href: string): string {
  return `[${label}](${href})`
}

/**
 * Wrap selected text in a markdown link.
 * The highlighted wording is always kept; only the destination URL is attached.
 */
export function insertMarkdownLink(
  value: string,
  start: number,
  end: number,
  href: string,
): {
  next: string
  selectStart: number
  selectEnd: number
} {
  if (start < 0 || end > value.length || start >= end) {
    throw new Error('Invalid selection range for link insert')
  }
  const selected = value.slice(start, end)
  if (!selected) {
    throw new Error('Empty selection for link insert')
  }
  const path = href.trim()
  if (!path) {
    throw new Error('Empty href for link insert')
  }
  const markdown = buildMarkdownLink(selected, path)
  const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`
  const after = start + markdown.length
  return {
    next,
    selectStart: after,
    selectEnd: after,
  }
}

/** Relative site paths only — work on localhost and production. */
export function isSafeBlogHref(href: string): boolean {
  const t = href.trim()
  if (!t) return false
  if (t.startsWith('//')) return false
  if (t.startsWith('/')) return true
  if (t.startsWith('#')) return true
  return false
}
