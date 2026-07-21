import type { ReactNode } from 'react'
import Link from 'next/link'
import { isSafeBlogHref } from '@/lib/blog-link-targets'

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

const linkClassName =
  'font-medium text-[#1a6b3c] underline underline-offset-2 transition-colors hover:text-[#145530]'

type RenderBlogInlineOptions = {
  /** Admin preview: open every link in a new tab so the editor isn’t left. */
  openInNewTab?: boolean
}

/**
 * Renders blog body strings with optional markdown-style links: [label](url).
 * Plain text otherwise — no HTML / markdown beyond inline links.
 */
export function renderBlogInline(
  text: string,
  options: RenderBlogInlineOptions = {},
): ReactNode {
  if (!text) return text

  const { openInNewTab = false } = options
  const parts: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  const re = new RegExp(LINK_RE.source, 'g')
  let key = 0

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }

    const label = match[1]
    const href = match[2]

    if (isSafeBlogHref(href)) {
      const internal = href.startsWith('/') || href.startsWith('#')
      if (openInNewTab || !internal) {
        parts.push(
          <a
            key={`l-${key++}`}
            href={href}
            className={linkClassName}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>,
        )
      } else {
        parts.push(
          <Link key={`l-${key++}`} href={href} className={linkClassName}>
            {label}
          </Link>,
        )
      }
    } else {
      parts.push(match[0])
    }

    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  if (parts.length === 0) return text
  if (parts.length === 1) return parts[0]
  return parts
}
