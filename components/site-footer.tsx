import Link from 'next/link'
import { servicePages } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPages } from '@/lib/solutions'

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-bold tracking-tight text-gray-900">
            xls<span style={{ color: '#1a6b3c' }}>EXPERTS</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gray-900">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-gray-900">
                All services
              </Link>
            </li>
            <li>
              <Link href={ALL_SOLUTIONS_HREF} className="hover:text-gray-900">
                All solutions
              </Link>
            </li>
            <li>
              <Link href="/enterprise" className="hover:text-gray-900">
                Enterprise
              </Link>
            </li>
            <li>
              <Link href="/use-cases" className="hover:text-gray-900">
                A.I. use cases
              </Link>
            </li>
          </ul>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Services
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            {servicePages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="hover:text-gray-900">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Solutions
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {solutionPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="hover:text-gray-900">
                  {page.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
