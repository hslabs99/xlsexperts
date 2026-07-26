import Link from 'next/link'
import { ALL_SOLUTIONS_HREF } from '@/lib/solutions'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-white/40">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-white/90' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function solutionsBreadcrumbJsonLd(
  items: {
    name: string
    href: string
  }[],
  origin: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Solutions',
        item: `${origin}${ALL_SOLUTIONS_HREF}`,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem' as const,
        position: index + 3,
        name: item.name,
        item: item.href.startsWith('http')
          ? item.href
          : `${origin}${item.href}`,
      })),
    ],
  }
}
