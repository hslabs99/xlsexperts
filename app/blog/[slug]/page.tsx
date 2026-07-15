import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllBlogPosts, getBlogPost } from '@/lib/blog'
import { Navbar } from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  const url = `https://www.xlsexperts.co.nz/blog/${post.slug}`
  const imageUrl = `https://www.xlsexperts.co.nz${post.image}`

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      siteName: 'XLS Experts',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `https://www.xlsexperts.co.nz${post.image}`,
    datePublished: new Date(post.date).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'XLS Experts',
      url: 'https://www.xlsexperts.co.nz',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.xlsexperts.co.nz/blog/${post.slug}`,
    },
  }

  // Build FAQPage schema if the post has FAQ sections
  const faqs = post.sections.filter((s) => s.type === 'faq').flatMap((s) => s.faqs ?? [])
  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero image */}
        <div className="relative h-64 w-full sm:h-80 lg:h-96">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(18,77,43,0.55)' }} />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-3xl px-6 pb-10">
              <span
                className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#86efac' }}
              >
                {post.category}
              </span>
              <h1 className="text-2xl font-bold leading-snug text-white text-balance sm:text-3xl lg:text-4xl">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="font-medium text-white">{post.author}</span>
                <span aria-hidden="true">·</span>
                <span>{post.date}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article body */}
        <div className="mx-auto max-w-3xl px-6 py-14">
          <Link
            href="/blog"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All posts
          </Link>

          <article className="prose prose-gray max-w-none">
            {post.sections.map((section, i) => {
              if (section.type === 'h2') {
                return (
                  <div key={i}>
                    <h2 className="mt-10 text-xl font-bold text-gray-900 sm:text-2xl">{section.heading}</h2>
                    {section.text && <p className="mt-3 text-base leading-relaxed text-gray-700">{section.text}</p>}
                  </div>
                )
              }
              if (section.type === 'h3') {
                return (
                  <div key={i}>
                    <h3 className="mt-7 text-lg font-bold text-gray-900">{section.heading}</h3>
                    {section.text && <p className="mt-2 text-base leading-relaxed text-gray-700">{section.text}</p>}
                  </div>
                )
              }
              if (section.type === 'intro' || section.type === 'p') {
                return (
                  <p key={i} className="mt-5 text-base leading-relaxed text-gray-700">
                    {section.text}
                  </p>
                )
              }
              if (section.type === 'ul') {
                return (
                  <ul key={i} className="mt-4 space-y-1.5 pl-5">
                    {section.items?.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-base text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: '#1a6b3c' }} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              }
              if (section.type === 'faq') {
                return (
                  <div key={i} className="mt-10">
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Frequently Asked Questions</h2>
                    <dl className="mt-6 space-y-6">
                      {section.faqs?.map((faq, j) => (
                        <div key={j} className="border-l-2 pl-5" style={{ borderColor: '#1a6b3c' }}>
                          <dt className="font-bold text-gray-900">{faq.q}</dt>
                          <dd className="mt-1.5 text-base leading-relaxed text-gray-700">{faq.a}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )
              }
              return null
            })}
          </article>

          {/* CTA */}
          <div className="mt-14 border-t border-gray-100 pt-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
              Ready to get started?
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Talk to an Excel expert today</h2>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-600">
              Book a free discovery call or send us an enquiry. We will assess your project and recommend the right approach.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/#contact"
                className="inline-flex h-11 items-center rounded-lg px-6 text-sm font-semibold text-white shadow-sm transition-colors"
                style={{ backgroundColor: '#1a6b3c' }}
              >
                Book a free discovery call
              </a>
              <a
                href="/#contact"
                className="inline-flex h-11 items-center rounded-lg border border-gray-200 px-6 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Send an enquiry
              </a>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 py-14" style={{ backgroundColor: '#e8f5ee' }}>
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-lg font-bold text-gray-900">More from the blog</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group flex gap-5 overflow-hidden border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="112px"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span
                        className="mb-1 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: '#1a6b3c' }}
                      >
                        {rel.category}
                      </span>
                      <h3 className="text-sm font-bold leading-snug text-gray-900 text-balance group-hover:underline">
                        {rel.title}
                      </h3>
                      <span className="mt-1 text-xs text-gray-500">{rel.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
