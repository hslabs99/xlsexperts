'use client'

/**
 * Captures contact CTA clicks and service/solution page views.
 * Uses capture-phase listeners + sendBeacon — zero impact on navigation speed.
 * Does not record events on localhost.
 *
 * Avoids importing heavy `solutions.ts` into the client bundle — paths only.
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackCtaClick, trackPageView } from '@/lib/track-funnel'
import { ALL_SERVICES_HREF, servicePageHrefs } from '@/lib/service-pages'

const ALL_SOLUTIONS_HREF = '/solutions'
const SERVICE_PATHS = new Set<string>([ALL_SERVICES_HREF, ...servicePageHrefs])

function normalizePath(path: string): string {
  if (!path) return '/'
  const bare = path.split('?')[0].split('#')[0] || '/'
  if (bare.length > 1 && bare.endsWith('/')) return bare.slice(0, -1)
  return bare
}

function isTrackedContentPath(path: string): boolean {
  if (SERVICE_PATHS.has(path)) return true
  if (path === ALL_SOLUTIONS_HREF) return true
  if (path.startsWith(`${ALL_SOLUTIONS_HREF}/`)) return true
  return false
}

function isContactHref(href: string): boolean {
  if (!href) return false
  const lower = href.toLowerCase()
  if (lower.startsWith('tel:')) return true
  if (lower.includes('#contact')) return true
  if (lower.includes('/thank-you')) return false
  return false
}

function labelFor(el: HTMLElement, href: string): string {
  const data = el.getAttribute('data-funnel-cta')?.trim()
  if (data) return data
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
  if (text && text.length <= 80) return text
  if (href.toLowerCase().startsWith('tel:')) return 'Call now'
  if (href.includes('#contact')) return 'Contact CTA'
  return 'Contact CTA'
}

export function FunnelTracker() {
  const pathname = usePathname()
  const lastViewed = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    const path = normalizePath(pathname)
    if (!isTrackedContentPath(path)) return
    if (lastViewed.current === path) return
    lastViewed.current = path
    // Label resolved on the server for charts; path is the source of truth.
    trackPageView({ label: path, path })
  }, [pathname])

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const funnelEl = target.closest<HTMLElement>('[data-funnel-cta]')
      if (funnelEl) {
        const href =
          funnelEl.getAttribute('href') ||
          funnelEl.getAttribute('data-funnel-href') ||
          '#contact'
        trackCtaClick({
          label: labelFor(funnelEl, href),
          href,
          path: pathname || window.location.pathname,
        })
        return
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!isContactHref(href)) return

      trackCtaClick({
        label: labelFor(anchor, href),
        href,
        path: pathname || window.location.pathname,
      })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])

  return null
}
