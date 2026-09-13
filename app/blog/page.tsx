import type { Metadata } from 'next'
import { marketPageMetadata } from '@/lib/seo'
import { getBlogListPosts } from '@/lib/blog'
import { Navbar } from '@/components/navbar'
import { BlogIndexClient } from '@/components/blog-index'
import { getMarket } from '@/lib/market-server'
import { serpTokensForMarket } from '@/lib/regions'

/** Always resolve posts from Firestore (not a static build snapshot). */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/blog',
    title: 'Blog',
    description:
      'Insights, guides, and case studies on Excel consulting, VBA automation, financial modelling, and data solutions.',
  })
}

export default async function BlogIndex() {
  const posts = await getBlogListPosts()
  const { region } = serpTokensForMarket(await getMarket())

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div
          className="border-b border-gray-100 py-16 sm:py-20"
          style={{ backgroundColor: '#e8f5ee' }}
        >
          <div className="mx-auto max-w-6xl px-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#1a6b3c' }}
            >
              Insights &amp; Guides
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 text-balance sm:text-5xl">
              The XLS Experts Blog
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
              Practical advice on Excel consulting, automation, financial
              modelling, and data solutions for {region} businesses.
            </p>
          </div>
        </div>

        <BlogIndexClient posts={posts} />
        <nav className="sr-only" aria-label="All blog posts">
          {posts.map((post) => (
            <a key={post.slug} href={`/blog/${post.slug}`}>
              {post.title}
            </a>
          ))}
        </nav>
      </main>
    </>
  )
}
