'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, ChevronUp, Phone, X } from 'lucide-react'
import { pageHasContactSection } from '@/lib/service-pages'
import {
  ALL_SERVICES_MENU_HREF,
  ALL_SOLUTIONS_MENU_HREF,
  DEFAULT_FIND_OUT_ABOUT,
  type FindOutAboutContent,
} from '@/lib/find-out-about'
import { useMarketCopy } from '@/components/market-provider'
import {
  SiteChatButton,
  SiteChatPanel,
  useSiteChatUi,
} from '@/components/site-chat-widget'

type OpenPanel = 'find-out' | 'contact' | 'chat' | null

function resolveContactHref(pathname: string | null): string {
  const path = pathname || '/'
  if (pageHasContactSection(path)) return '#contact'
  return '/#contact'
}

export function FloatingConsultationCta() {
  const pathname = usePathname()
  const isAdmin = Boolean(pathname?.startsWith('/admin'))

  if (isAdmin) return null

  return <FloatingConsultationCtaInner pathname={pathname} />
}

function FloatingConsultationCtaInner({
  pathname,
}: {
  pathname: string | null
}) {
  const marketCopy = useMarketCopy()
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [contactFromChatTimeout, setContactFromChatTimeout] = useState(false)
  const [findOutContent, setFindOutContent] = useState<FindOutAboutContent>(
    DEFAULT_FIND_OUT_ABOUT
  )
  const panelRef = useRef<HTMLDivElement>(null)
  const contactMenuId = useId()
  const findOutMenuId = useId()
  const chatOpen = openPanel === 'chat'
  const contactHref = resolveContactHref(pathname)
  const { panelId: chatPanelId, chat } = useSiteChatUi(chatOpen, {
    onNoReplyEscalate: () => {
      setContactFromChatTimeout(true)
      setOpenPanel('contact')
    },
  })

  useEffect(() => {
    let cancelled = false
    void fetch('/api/find-out-about')
      .then(async (res) => {
        const data = (await res.json()) as {
          ok?: boolean
          content?: FindOutAboutContent
        }
        if (cancelled) return
        if (data.ok && data.content?.items) {
          setFindOutContent(data.content)
        }
      })
      .catch(() => {
        /* keep defaults */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!openPanel) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (panelRef.current && target && !panelRef.current.contains(target)) {
        setOpenPanel(null)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openPanel])

  useEffect(() => {
    setOpenPanel(null)
    setContactFromChatTimeout(false)
  }, [pathname])

  useEffect(() => {
    if (openPanel !== 'contact') setContactFromChatTimeout(false)
  }, [openPanel])

  const browseLinks = [
    { ...findOutContent.services, href: ALL_SERVICES_MENU_HREF },
    { ...findOutContent.solutions, href: ALL_SOLUTIONS_MENU_HREF },
  ].filter((link) => link.enabled)
  const showFindOut = findOutContent.items.length > 0 || browseLinks.length > 0
  const findOutOpen = openPanel === 'find-out'
  const contactOpen = openPanel === 'contact'

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8"
    >
      {findOutOpen && showFindOut && (
        <div
          id={findOutMenuId}
          role="dialog"
          aria-label="Find out about"
          className="w-[min(100vw-2.5rem,20rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15"
        >
          <div className="border-b border-gray-100 bg-[#e8f5ee] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
              Find out about
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Jump straight to what you came for.
            </p>
          </div>

          <div className="max-h-[min(65vh,30rem)] overflow-y-auto">
            {findOutContent.items.length > 0 && (
              <nav className="space-y-1 p-2">
                {findOutContent.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpenPanel(null)}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[#1a6b3c]"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            )}

            {browseLinks.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/70 p-2">
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  {findOutContent.browseHeading}
                </p>
                <nav className="space-y-1">
                  {browseLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpenPanel(null)}
                      className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
                    >
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-900">
                        {link.label}
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-[#1a6b3c]"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        {link.description}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {contactOpen && (
        <div
          id={contactMenuId}
          role="dialog"
          aria-label="Get in touch"
          className="w-[min(100vw-2.5rem,17.5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15"
        >
          <div className="border-b border-gray-100 bg-[#e8f5ee] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
              Get in touch
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {contactFromChatTimeout
                ? 'We’re not available in chat right now — leave an enquiry or book a discovery call.'
                : 'Call us, or send an enquiry / book a discovery call.'}
            </p>
          </div>

          <div className="space-y-2 p-3">
            <a
              href={`tel:${marketCopy.contact.phoneTel}`}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {marketCopy.contact.phoneDisplay}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">Call now</span>
              </span>
            </a>

            <a
              href={contactHref}
              onClick={() => setOpenPanel(null)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6b3c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#155a32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
            >
              Enquiry or discovery call
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}

      <SiteChatPanel
        open={chatOpen}
        onClose={() => setOpenPanel(null)}
        panelId={chatPanelId}
        chat={chat}
        contactHref={contactHref}
        onOpenContact={() => {
          setContactFromChatTimeout(true)
          setOpenPanel('contact')
        }}
      />

      <div className="flex flex-col items-end gap-2">
        {showFindOut && (
          <button
            type="button"
            aria-expanded={findOutOpen}
            aria-controls={findOutMenuId}
            aria-haspopup="dialog"
            onClick={() =>
              setOpenPanel((value) => (value === 'find-out' ? null : 'find-out'))
            }
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#1a6b3c] shadow-lg shadow-gray-900/10 ring-1 ring-[#1a6b3c]/25 transition hover:bg-[#e8f5ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] sm:px-5"
          >
            {findOutOpen ? (
              <>
                Close
                <X className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                Find out about
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        )}

        <SiteChatButton
          open={chatOpen}
          onOpenChange={(next) => setOpenPanel(next ? 'chat' : null)}
          panelId={chatPanelId}
          hasUnread={chat.hasUnread}
        />

        <button
          type="button"
          aria-expanded={contactOpen}
          aria-controls={contactMenuId}
          aria-haspopup="dialog"
          onClick={() =>
            setOpenPanel((value) => (value === 'contact' ? null : 'contact'))
          }
          className="inline-flex items-center gap-2 rounded-full bg-[#1a6b3c] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1a6b3c]/30 ring-1 ring-white/20 transition hover:bg-[#155a32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] sm:px-5"
        >
          {contactOpen ? (
            <>
              Close
              <X className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Get in touch
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
