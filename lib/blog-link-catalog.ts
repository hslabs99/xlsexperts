/**
 * Admin-only link destination catalogs for the blog editor.
 * Kept separate from `blog-link-targets` so the public blog page does not
 * pull service/solution page data into its bundle.
 */

import {
  BLOG_HOME_SECTIONS,
  BLOG_SITE_PAGES,
  type BlogLinkTarget,
} from '@/lib/blog-link-targets'
import { servicePages } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPages } from '@/lib/solutions'

export const BLOG_LINK_SERVICE_PAGES: readonly BlogLinkTarget[] = servicePages
  .slice()
  .sort((a, b) => a.label.localeCompare(b.label))
  .map((p) => ({ label: p.label, href: p.href }))

export const BLOG_LINK_SOLUTION_PAGES: readonly BlogLinkTarget[] = [
  { label: 'All solutions', href: ALL_SOLUTIONS_HREF },
  ...[...solutionPages]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((p) => ({ label: p.title, href: p.href })),
]

export function allStaticBlogLinkTargets(
  extra: readonly BlogLinkTarget[] = [],
): BlogLinkTarget[] {
  return [
    ...BLOG_SITE_PAGES,
    ...BLOG_HOME_SECTIONS,
    ...BLOG_LINK_SERVICE_PAGES,
    ...BLOG_LINK_SOLUTION_PAGES,
    ...extra,
  ]
}

export function findCatalogLinkTarget(
  href: string,
  extra: readonly BlogLinkTarget[] = [],
): BlogLinkTarget | undefined {
  const path = href.trim()
  if (!path) return undefined
  return allStaticBlogLinkTargets(extra).find((t) => t.href === path)
}

/** Other blog posts for the editor dropdown, excluding the post being edited. */
export function otherBlogLinkTargets(
  posts: readonly { slug: string; title?: string; published?: boolean }[],
  currentSlug = '',
): BlogLinkTarget[] {
  const current = currentSlug.trim()
  return posts
    .filter((p) => p.slug && p.slug !== current)
    .map((p) => {
      const title = (p.title ?? '').trim() || p.slug
      return {
        label: p.published === false ? `${title} (draft)` : title,
        href: `/blog/${p.slug}`,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}
