import Link from 'next/link'
import { contextualServiceLinksForPost } from '@/lib/blog-internal-links'

export function BlogServiceLinks({
  slug,
  category,
}: {
  slug: string
  category: string
}) {
  const links = contextualServiceLinksForPost(slug, category)
  if (links.length === 0) return null

  return (
    <p className="mt-6 text-base leading-relaxed text-gray-700">
      Related services:{' '}
      {links.map((link, index) => (
        <span key={`${link.href}:${link.anchor}`}>
          {index > 0 ? <span className="text-gray-400"> · </span> : null}
          <Link
            href={link.href}
            className="font-semibold underline decoration-[#1a6b3c]/40 underline-offset-2 hover:decoration-[#1a6b3c]"
            style={{ color: '#1a6b3c' }}
          >
            {link.anchor}
          </Link>
        </span>
      ))}
    </p>
  )
}
