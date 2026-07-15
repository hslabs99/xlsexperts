'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'How We Work', href: '#how-we-work' },
  { label: 'Services', href: '#services' },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '/enterprise-excel-vba-development' },
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '/blog' },
]

/**
 * Home section anchors only exist on `/` (and `#contact` also on enterprise).
 * From blog/admin/etc. resolve bare hashes to `/#…` so the menu always navigates.
 */
function resolveNavHref(href: string, pathname: string | null): string {
  if (!href.startsWith('#')) return href

  const path = pathname || '/'
  const onHome = path === '/'
  const onEnterprise = path.startsWith('/enterprise-excel-vba-development')

  // Contact form is mounted on home and enterprise
  if (href === '#contact' && (onHome || onEnterprise)) return href

  // Other section IDs exist on the home page only
  if (onHome) return href
  return `/${href}`
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const links = navLinks.map((link) => ({
    ...link,
    href: resolveNavHref(link.href, pathname),
  }))
  const contactHref = resolveNavHref('#contact', pathname)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
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
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={contactHref}
            className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Send an enquiry
          </a>
          <a
            href={contactHref}
            className="btn-primary inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold shadow-sm"
          >
            Book a free discovery call
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
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={contactHref}
              className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#1a6b3c' }}
              onClick={() => setMobileOpen(false)}
            >
              Book a free discovery call
            </a>
            <a
              href={contactHref}
              className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Send an enquiry
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
