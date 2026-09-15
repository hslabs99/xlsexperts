'use client'

import { useEffect, useRef, useState } from 'react'
import {
  cmsFocusRingClass,
  parseAdminFocusHash,
  scrollCmsAnchor,
  type AdminFocus,
  type CmsFocusSection,
} from '@/lib/admin-focus'

/**
 * Apply a Publish health-check deep link to a CMS editor, then scroll to it.
 * `apply` should set local market/path state and return the element id to highlight.
 */
export function useCmsEditorFocus(
  section: CmsFocusSection,
  apply: (focus: AdminFocus) => string | null
): string | null {
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const applyRef = useRef(apply)
  applyRef.current = apply

  useEffect(() => {
    function handle() {
      const focus = parseAdminFocusHash(window.location.hash)
      if (!focus || focus.cms !== section) return
      const id = applyRef.current(focus)
      setHighlightId(id)
      if (id) {
        scrollCmsAnchor(id, id.includes('faqs') ? 'start' : 'center')
      }
    }
    handle()
    window.addEventListener('hashchange', handle)
    return () => window.removeEventListener('hashchange', handle)
  }, [section])

  useEffect(() => {
    if (highlightId) scrollCmsAnchor(highlightId)
  }, [highlightId])

  return highlightId
}

export { cmsFocusRingClass }
