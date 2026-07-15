import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Blog — XLS Experts NZ',
  description:
    'Insights, guides, and case studies on Excel consulting, VBA automation, financial modelling, and data solutions for New Zealand businesses.',
  alternates: {
    canonical: 'https://www.xlsexperts.co.nz/blog',
  },
  openGraph: {
    title: 'Blog — XLS Experts NZ',
    description:
      'Insights, guides, and case studies on Excel consulting, VBA automation, financial modelling, and data solutions for New Zealand businesses.',
    url: 'https://www.xlsexperts.co.nz/blog',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

export default function BlogIndex() {
  const [featured, ...rest] = getAllBlogPosts()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100 py-16 sm:py-20" style={{ backgroundColor: '#e8f5ee' }}>
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
              Insights &amp; Guides
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-balance">
              The XLS Experts Blog
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
              Practical advice on Excel consulting, automation, financial modelling, and data solutions for New Zealand businesses.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16">
          {/* Featured post */}
          <Link href={`/blog/${featured.slug}`} className="group mb-14 grid gap-8 overflow-hidden border border-gray-200 bg-white transition-shadow hover:shadow-md lg:grid-cols-2">
            <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="flex flex-col justify-center px-8 py-10">
              <span
                className="mb-3 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: '#e8f5ee', color: '#1a6b3c' }}
              >
                {featured.category}
              </span>
              <h2 className="text-2xl font-bold leading-snug text-gray-900 text-balance group-hover:underline sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600 line-clamp-3">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{featured.author}</span>
                <span aria-hidden="true">·</span>
                <span>{featured.date}</span>
                <span aria-hidden="true">·</span>
                <span>{featured.readTime}</span>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden border border-gray-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span
                    className="mb-3 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                    style={{ backgroundColor: '#e8f5ee', color: '#1a6b3c' }}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-lg font-bold leading-snug text-gray-900 text-balance group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{post.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
