import Link from 'next/link'
import { getBlogListPosts } from '@/lib/blog'
import { relatedPostsForTopic, topicHrefForPath } from '@/lib/blog-internal-links'

export async function RelatedReading({ topicHref }: { topicHref: string }) {
  const posts = await getBlogListPosts()
  const related = relatedPostsForTopic(topicHrefForPath(topicHref), posts, 3)
  if (related.length === 0) return null

  return (
    <section className="border-t border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#1a6b3c' }}
        >
          Related reading
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          From the blog
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: '#1a6b3c' }}
                >
                  {post.category}
                </span>
                <span className="mt-2 block text-sm font-bold leading-snug text-gray-900">
                  {post.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
