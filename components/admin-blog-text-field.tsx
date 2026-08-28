'use client'

import { useRef, useState } from 'react'
import { AdminBlogLinkToolbar } from '@/components/admin-blog-link-toolbar'
import { renderBlogInline } from '@/lib/blog-inline-markup'
import { findCatalogLinkTarget } from '@/lib/blog-link-catalog'
import {
  insertMarkdownLink,
  isSafeBlogHref,
  type BlogLinkTarget,
} from '@/lib/blog-link-targets'

type SelectionRange = { start: number; end: number }

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  showToolbar?: boolean
  blogTargets?: readonly BlogLinkTarget[]
}

export function AdminBlogTextField({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = 'mt-2 w-full rounded-md border border-border px-3 py-2 text-sm',
  showToolbar = true,
  blogTargets = [],
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  // Last non-empty highlight — survives focus moving to the dropdown
  const selectionRef = useRef<SelectionRange | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [linkOk, setLinkOk] = useState(false)

  function captureSelection() {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start !== end) {
      selectionRef.current = { start, end }
    }
  }

  function linkSelection(href: string): boolean {
    const path = href.trim()
    if (!isSafeBlogHref(path) || !findCatalogLinkTarget(path, blogTargets)) {
      return false
    }

    const el = ref.current
    // Prefer live textarea contents over React props (avoids stale closures)
    const text = el?.value ?? value

    let start: number
    let end: number

    if (el && document.activeElement === el && el.selectionStart !== el.selectionEnd) {
      start = el.selectionStart
      end = el.selectionEnd
      selectionRef.current = { start, end }
    } else if (selectionRef.current) {
      start = selectionRef.current.start
      end = selectionRef.current.end
    } else {
      return false
    }

    if (start < 0 || end > text.length || start >= end) return false

    try {
      const result = insertMarkdownLink(text, start, end, path)
      onChange(result.next)
      selectionRef.current = null
      setLinkOk(true)
      window.setTimeout(() => setLinkOk(false), 2500)

      requestAnimationFrame(() => {
        const box = ref.current
        if (!box) return
        box.focus()
        box.setSelectionRange(result.selectStart, result.selectEnd)
      })
      return true
    } catch {
      return false
    }
  }

  return (
    <div>
      {showToolbar ? (
        <AdminBlogLinkToolbar
          onLinkSelection={linkSelection}
          previewOpen={previewOpen}
          onTogglePreview={() => setPreviewOpen((v) => !v)}
          linkOk={linkOk}
          blogTargets={blogTargets}
        />
      ) : null}

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={captureSelection}
        onKeyUp={captureSelection}
        onMouseUp={captureSelection}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />

      {previewOpen ? (
        <div className="mt-2 rounded-md border border-dashed border-border bg-surface-raised px-3 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Preview
          </p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {value.trim() ? (
              renderBlogInline(value, { openInNewTab: true })
            ) : (
              <span className="text-ink-muted">Nothing to preview yet.</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
