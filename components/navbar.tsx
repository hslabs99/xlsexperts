'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { pageHasContactSection, servicePages } from '@/lib/service-pages'

const navLinks = [
  { label: 'How We Work', href: '#how-we-work' },
  { label: 'Services', href: '#services', dropdown: true as const },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'Enterprise', href: '/enterprise-excel-vba-development' },
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '/blog' },
]

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

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const links = navLinks.map((link) => ({
    ...link,
    href: resolveNavHref(link.href, pathname),
  }))
  const contactHref = resolveNavHref('#contact', pathname)
  const servicesOverviewHref = '/services'

  useEffect(() => {
    if (!servicesOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setServicesOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [servicesOpen])

  useEffect(() => {
    setServicesOpen(false)
    setMobileServicesOpen(false)
    setMobileOpen(false)
  }, [pathname])

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

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {links.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="relative flex items-center" ref={servicesRef}>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 p-0 text-sm font-medium leading-none text-gray-500 transition-colors hover:text-gray-900"
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  onClick={() => setServicesOpen((open) => !open)}
                >
                  Services
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {servicesOpen && (
                  <div
                    className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                    role="menu"
                    aria-label="Services"
                  >
                    <a
                      href={servicesOverviewHref}
                      className="block border-b border-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setServicesOpen(false)}
                    >
                      All services overview
                    </a>
                    <div className="max-h-[70vh] overflow-y-auto py-1">
                      {servicePages.map((service) => (
                        <a
                          key={service.href}
                          href={service.href}
                          className="block px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => setServicesOpen(false)}
                        >
                          {service.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex h-8 items-center text-sm font-medium leading-none text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center md:flex">
          <a
            href={contactHref}
            className="btn-primary inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold shadow-sm"
          >
            Contact Us
          </a>
        </div>

        <button
          className="flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) =>
              link.dropdown ? (
                <div key={link.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    aria-expanded={mobileServicesOpen}
                    onClick={() => setMobileServicesOpen((open) => !open)}
                  >
                    Services
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {mobileServicesOpen && (
                    <div className="mb-1 ml-2 border-l border-gray-200 pl-3">
                      <a
                        href={servicesOverviewHref}
                        className="block rounded-md px-2 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        All services overview
                      </a>
                      {servicePages.map((service) => (
                        <a
                          key={service.href}
                          href={service.href}
                          className="block rounded-md px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => setMobileOpen(false)}
                        >
                          {service.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
          <div className="mt-3">
            <a
              href={contactHref}
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
