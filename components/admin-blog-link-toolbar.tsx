'use client'

import { useId, useRef, useState } from 'react'
import { Link2 } from 'lucide-react'
import {
  BLOG_LINK_SERVICE_PAGES,
  BLOG_LINK_SOLUTION_PAGES,
  findCatalogLinkTarget,
} from '@/lib/blog-link-catalog'
import {
  BLOG_HOME_SECTIONS,
  BLOG_SITE_PAGES,
  isSafeBlogHref,
  type BlogLinkTarget,
} from '@/lib/blog-link-targets'

type Props = {
  /** Apply destination to the current text highlight. Returns false on failure. */
  onLinkSelection: (href: string) => boolean
  previewOpen: boolean
  onTogglePreview: () => void
  linkOk?: boolean
  /** Other blog posts, typically excluding the one being edited. */
  blogTargets?: readonly BlogLinkTarget[]
}

export function AdminBlogLinkToolbar({
  onLinkSelection,
  previewOpen,
  onTogglePreview,
  linkOk = false,
  blogTargets = [],
}: Props) {
  const selectId = useId()
  const selectRef = useRef<HTMLSelectElement>(null)
  // Empty until the admin picks something — never default to Home "/"
  const [href, setHref] = useState('')
  const [hint, setHint] = useState<string | null>(null)

  function handleLink() {
    setHint(null)
    // Read live from the DOM so we never use a stale React value
    const live = (selectRef.current?.value ?? href).trim()
    if (!live) {
      setHint('1) Choose a destination from the list first.')
      return
    }
    if (!isSafeBlogHref(live) || !findCatalogLinkTarget(live, blogTargets)) {
      setHint('That destination is not in the list. Pick again.')
      return
    }
    const ok = onLinkSelection(live)
    if (!ok) {
      setHint('2) Highlight the text in the box below, then click Add link.')
    }
  }

  const chosen = href ? findCatalogLinkTarget(href, blogTargets) : undefined

  return (
    <div className="mt-2 space-y-2">
      <div className="rounded-md border border-border bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
          <Link2 className="h-3 w-3" aria-hidden />
          Link destination
        </div>

        <label htmlFor={selectId} className="sr-only">
          Destination
        </label>
        <select
          ref={selectRef}
          id={selectId}
          value={href}
          onChange={(e) => {
            setHref(e.target.value)
            setHint(null)
          }}
          className="block w-full max-w-[55ch] rounded border border-border bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Choose a page or blog post…</option>
          <optgroup label="Site pages">
            {BLOG_SITE_PAGES.map((p) => (
              <option key={`site:${p.href}`} value={p.href}>
                {p.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Home sections">
            {BLOG_HOME_SECTIONS.map((p) => (
              <option key={`home:${p.href}`} value={p.href}>
                {p.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Solution pages">
            {BLOG_LINK_SOLUTION_PAGES.map((p) => (
              <option key={`solution:${p.href}`} value={p.href}>
                {p.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Service pages">
            {BLOG_LINK_SERVICE_PAGES.map((p) => (
              <option key={`service:${p.href}`} value={p.href}>
                {p.label}
              </option>
            ))}
          </optgroup>
          {blogTargets.length > 0 ? (
            <optgroup label="Other blogs">
              {blogTargets.map((p) => (
                <option key={`blog:${p.href}`} value={p.href}>
                  {p.label}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>

        {chosen ? (
          <p className="mt-1.5 font-mono text-[11px] text-ink-muted">
            Will link to: <span className="text-ink">{chosen.href}</span>
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLink}
            className="inline-flex items-center rounded border border-brand/40 bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-dark hover:border-brand hover:bg-brand/15"
          >
            Add link
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onTogglePreview}
            className={`inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold ${
              previewOpen
                ? 'border-brand bg-brand text-white'
                : 'border-border text-ink hover:border-brand hover:text-brand'
            }`}
          >
            {previewOpen ? 'Hide preview' : 'Preview'}
          </button>
        </div>
      </div>

      {linkOk ? (
        <p className="text-[11px] font-medium text-brand-dark">Link added.</p>
      ) : hint ? (
        <p className="text-[11px] font-medium text-amber-800">{hint}</p>
      ) : (
        <p className="text-[11px] text-ink-muted">
          1) Choose a destination. 2) Highlight the text. 3) Click Add link.
        </p>
      )}
    </div>
  )
}
