'use client'

/**
 * Loads analytics / marketing tags from Firebase and injects them on public pages.
 * Tags are market-scoped: .co.nz and .com never share GA/GTM/campaign snippets.
 * Skips /admin so staff browsing the CMS does not inflate marketing traffic.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import {
  DEFAULT_SITE_TAGS,
  type SiteTagsContent,
} from '@/lib/site-tags'

const INJECTED_ATTR = 'data-xls-site-tag'

function injectHtmlFragment(html: string, target: HTMLElement) {
  const trimmed = html.trim()
  if (!trimmed) return

  const template = document.createElement('template')
  template.innerHTML = trimmed

  Array.from(template.content.childNodes).forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const source = node as HTMLScriptElement
      const script = document.createElement('script')
      Array.from(source.attributes).forEach((attr) => {
        script.setAttribute(attr.name, attr.value)
      })
      script.setAttribute(INJECTED_ATTR, '1')
      if (source.textContent) script.text = source.textContent
      target.appendChild(script)
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = (node as Element).cloneNode(true) as HTMLElement
      clone.setAttribute(INJECTED_ATTR, '1')
      target.appendChild(clone)
      return
    }

    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      target.appendChild(document.createTextNode(node.textContent))
    }
  })
}

function clearInjected() {
  document
    .querySelectorAll(`[${INJECTED_ATTR}]`)
    .forEach((el) => el.remove())
}

export function SiteTags() {
  const pathname = usePathname()
  const [tags, setTags] = useState<SiteTagsContent>(DEFAULT_SITE_TAGS)
  const injectedKey = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/site-tags')
      .then(async (res) => {
        const data = (await res.json()) as {
          ok?: boolean
          tags?: SiteTagsContent
        }
        if (!cancelled) setTags(data.ok && data.tags ? data.tags : DEFAULT_SITE_TAGS)
      })
      .catch(() => {
        if (!cancelled) setTags(DEFAULT_SITE_TAGS)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onAdmin = pathname?.startsWith('/admin') ?? false

  useEffect(() => {
    if (onAdmin || !tags.enabled) {
      clearInjected()
      injectedKey.current = null
      return
    }

    const key = JSON.stringify({
      head: tags.headHtml,
      body: tags.bodyHtml,
      gtm: tags.googleTagManagerId,
      ga: tags.googleAnalyticsId,
    })
    if (injectedKey.current === key) return

    clearInjected()
    injectHtmlFragment(tags.headHtml, document.head)
    injectHtmlFragment(tags.bodyHtml, document.body)
    injectedKey.current = key

    return () => {
      clearInjected()
      injectedKey.current = null
    }
  }, [
    onAdmin,
    tags.enabled,
    tags.headHtml,
    tags.bodyHtml,
    tags.googleTagManagerId,
    tags.googleAnalyticsId,
  ])

  if (onAdmin || !tags.enabled) return null

  const gtm = tags.googleTagManagerId.trim()
  const ga = tags.googleAnalyticsId.trim()

  return (
    <>
      {gtm ? (
        <>
          <Script id="xls-gtm" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');
          `}</Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="xls-ga4" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga}');
          `}</Script>
        </>
      ) : null}
    </>
  )
}
