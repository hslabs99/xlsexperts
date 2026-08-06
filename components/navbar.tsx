'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { pageHasContactSection, servicePages } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPages } from '@/lib/solutions'

const navLinks = [
  { label: 'How We Work', href: '#how-we-work' },
  { label: 'Services', href: '#services', dropdown: 'services' as const },
  { label: 'Solutions', href: ALL_SOLUTIONS_HREF, dropdown: 'solutions' as const },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '/blog' },
]

const DROPDOWN_SUMMARIES = {
  services: 'We supply the following technical services.',
  solutions: 'We have knowledge of, and experience in delivering the following solutions.',
} as const

/**
 * Home section anchors only exist on `/` (and `#contact` on pages with Contact).
 * From blog/admin/etc. resolve bare hashes to `/#…` so the menu always navigates.
 */
function resolveNavHref(href: string, pathname: string | null): string {
  if (!href.startsWith('#')) return href

  const path = pathname || '/'
  const onHome = path === '/'

  if (href === '#contact' && pageHasContactSection(path)) return href
  if (onHome) return href
  return `/${href}`
}

type OpenMenu = 'services' | 'solutions' | null

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState<OpenMenu>(null)
  const [mobileOpenMenu, setMobileOpenMenu] = useState<OpenMenu>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const solutionsRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const links = navLinks.map((link) => ({
    ...link,
    href: resolveNavHref(link.href, pathname),
  }))
  const contactHref = resolveNavHref('#contact', pathname)
  const servicesOverviewHref = '/services'

  useEffect(() => {
    if (!desktopOpen) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      const inServices =
        servicesRef.current && servicesRef.current.contains(target)
      const inSolutions =
        solutionsRef.current && solutionsRef.current.contains(target)
      if (!inServices && !inSolutions) setDesktopOpen(null)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDesktopOpen(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [desktopOpen])

  useEffect(() => {
    setDesktopOpen(null)
    setMobileOpenMenu(null)
    setMobileOpen(false)
  }, [pathname])

  function renderDesktopDropdown(
    kind: 'services' | 'solutions',
    buttonLabel: string,
    overviewHref: string,
    overviewLabel: string,
    items: { href: string; label: string }[],
    ref: RefObject<HTMLDivElement | null>,
  ) {
    const open = desktopOpen === kind
    const summary = DROPDOWN_SUMMARIES[kind]
    return (
      <div key={buttonLabel} className="relative flex items-center" ref={ref}>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 p-0 text-sm font-medium leading-none text-gray-500 transition-colors hover:text-gray-900"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setDesktopOpen((current) => (current === kind ? null : kind))}
        >
          {buttonLabel}
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {open && (
          <div
            className={`absolute top-full z-50 mt-3 rounded-lg border border-gray-200 bg-white py-2 shadow-lg ${
              kind === 'solutions'
                ? 'left-0 w-80'
                : 'left-1/2 w-72 -translate-x-1/2'
            }`}
            role="menu"
            aria-label={buttonLabel}
          >
            <a
              href={overviewHref}
              className="block border-b border-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50"
              role="menuitem"
              onClick={() => setDesktopOpen(null)}
            >
              <span className="block text-sm font-semibold text-gray-900">
                {overviewLabel}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                {summary}
              </span>
            </a>
            <div className="max-h-[70vh] overflow-y-auto py-1">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => setDesktopOpen(null)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderMobileDropdown(
    kind: 'services' | 'solutions',
    buttonLabel: string,
    overviewHref: string,
    overviewLabel: string,
    items: { href: string; label: string }[],
  ) {
    const open = mobileOpenMenu === kind
    const summary = DROPDOWN_SUMMARIES[kind]
    return (
      <div key={buttonLabel}>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          aria-expanded={open}
          onClick={() =>
            setMobileOpenMenu((current) => (current === kind ? null : kind))
          }
        >
          {buttonLabel}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {open && (
          <div className="mb-1 ml-2 border-l border-gray-200 pl-3">
            <a
              href={overviewHref}
              className="block rounded-md px-2 py-2 transition-colors hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <span className="block text-sm font-semibold text-gray-900">
                {overviewLabel}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                {summary}
              </span>
            </a>
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-md px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }
  const solutionItems = solutionPages.map((s) => ({
    href: s.href,
    label: s.navLabel,
  }))
  const serviceItems = servicePages.map((s) => ({
    href: s.href,
    label: s.label,
  }))

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-[#1a6b3c] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2" aria-label="XLS Experts home">
          <svg
            aria-hidden="true"
            className="h-7 w-7 shrink-0"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="28" height="28" rx="5" fill="#1a6b3c" />
            <line x1="10" y1="6" x2="10" y2="22" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="18" y1="6" x2="18" y2="22" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="6" y1="11" x2="22" y2="11" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="6" y1="17" x2="22" y2="17" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
            <path d="M7 7l4 4m0-4l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="13" y="9" width="3" height="5" rx="1" fill="white" fillOpacity="0.9" />
            <path d="M18 7h3v2h-2v1h2v2h-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>

          <span className="text-[15px] font-bold tracking-tight text-gray-900">
            xls<span style={{ color: '#1a6b3c' }}>EXPERTS</span>
          </span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => {
            if (link.dropdown === 'services') {
              return renderDesktopDropdown(
                'services',
                'Services',
                servicesOverviewHref,
                'All Services',
                serviceItems,
                servicesRef,
              )
            }
            if (link.dropdown === 'solutions') {
              return renderDesktopDropdown(
                'solutions',
                'Solutions',
                ALL_SOLUTIONS_HREF,
                'All Solutions',
                solutionItems,
                solutionsRef,
              )
            }
            return (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex h-8 items-center text-sm font-medium leading-none text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden items-center lg:flex">
          <a
            href={contactHref}
            data-funnel-cta="Contact Us"
            className="btn-primary inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold shadow-sm"
          >
            Contact Us
          </a>
        </div>

        <button
          className="flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => {
              if (link.dropdown === 'services') {
                return renderMobileDropdown(
                  'services',
                  'Services',
                  servicesOverviewHref,
                  'All Services',
                  serviceItems,
                )
              }
              if (link.dropdown === 'solutions') {
                return renderMobileDropdown(
                  'solutions',
                  'Solutions',
                  ALL_SOLUTIONS_HREF,
                  'All Solutions',
                  solutionItems,
                )
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>
          <div className="mt-3">
            <a
              href={contactHref}
              data-funnel-cta="Contact Us"
              className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#1a6b3c' }}
              onClick={() => setMobileOpen(false)}
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
