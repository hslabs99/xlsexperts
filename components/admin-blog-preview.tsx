'use client'

/**
 * Visual previews matching public /blog and /blog/[slug] layouts.
 * Used in Admin → Blog so staff can check list cards and full articles.
 */

import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { BlogPost, BlogSection } from '@/lib/types'
import { BlogImageSizeAdvice } from '@/components/blog-image-size-advice'

function HeroImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-100 text-xs text-stone-500 ${className ?? ''}`}
      >
        No image
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith('http') || src.startsWith('blob:')}
    />
  )
}

function SectionBlocks({ sections }: { sections: BlogSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        if (section.type === 'h2') {
          return (
            <div key={i}>
              <h2 className="mt-10 text-xl font-bold text-gray-900 sm:text-2xl">
                {section.heading || 'Untitled heading'}
              </h2>
              {section.text ? (
                <p className="mt-3 text-base leading-relaxed text-gray-700">
                  {section.text}
                </p>
              ) : null}
            </div>
          )
        }
        if (section.type === 'h3') {
          return (
            <div key={i}>
              <h3 className="mt-7 text-lg font-bold text-gray-900">
                {section.heading || 'Untitled subheading'}
              </h3>
              {section.text ? (
                <p className="mt-2 text-base leading-relaxed text-gray-700">
                  {section.text}
                </p>
              ) : null}
            </div>
          )
        }
        if (section.type === 'intro' || section.type === 'p') {
          return (
            <p key={i} className="mt-5 text-base leading-relaxed text-gray-700">
              {section.text || '…'}
            </p>
          )
        }
        if (section.type === 'ul') {
          return (
            <ul key={i} className="mt-4 space-y-1.5 pl-5">
              {(section.items?.length ? section.items : ['…']).map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-base text-gray-700"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: '#1a6b3c' }}
                    aria-hidden="true"
                  />
                  {item || '…'}
                </li>
              ))}
            </ul>
          )
        }
        if (section.type === 'faq') {
          return (
            <div key={i} className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Frequently Asked Questions
              </h2>
              <dl className="mt-6 space-y-6">
                {(section.faqs?.length ? section.faqs : [{ q: '…', a: '…' }]).map(
                  (faq, j) => (
                    <div
                      key={j}
                      className="border-l-2 pl-5"
                      style={{ borderColor: '#1a6b3c' }}
                    >
                      <dt className="font-bold text-gray-900">
                        {faq.q || 'Question'}
                      </dt>
                      <dd className="mt-1.5 text-base leading-relaxed text-gray-700">
                        {faq.a || 'Answer'}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </div>
          )
        }
        return null
      })}
    </>
  )
}

/** Card as shown in the /blog grid (non-featured). */
export function BlogListCardPreview({ post }: { post: BlogPost }) {
  return (
    <div className="group flex max-w-sm flex-col overflow-hidden border border-gray-200 bg-white">
      <div className="relative aspect-[16/9] overflow-hidden">
        <HeroImage
          src={post.image}
          alt={post.title}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span
          className="mb-3 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: '#e8f5ee', color: '#1a6b3c' }}
        >
          {post.category || 'Category'}
        </span>
        <h2 className="text-lg font-bold leading-snug text-gray-900 text-balance">
          {post.title || 'Untitled post'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2">
          {post.excerpt || 'Excerpt will appear here.'}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-gray-500">
          <span>{post.date || 'Date'}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readTime || 'Read time'}</span>
        </div>
      </div>
    </div>
  )
}

/** Featured layout as shown at the top of /blog. */
export function BlogListFeaturedPreview({ post }: { post: BlogPost }) {
  return (
    <div className="grid gap-8 overflow-hidden border border-gray-200 bg-white lg:grid-cols-2">
      <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[280px]">
        <HeroImage
          src={post.image}
          alt={post.title}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-center px-8 py-10">
        <span
          className="mb-3 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: '#e8f5ee', color: '#1a6b3c' }}
        >
          {post.category || 'Category'}
        </span>
        <h2 className="text-2xl font-bold leading-snug text-gray-900 text-balance sm:text-3xl">
          {post.title || 'Untitled post'}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-gray-600 line-clamp-3">
          {post.excerpt || 'Excerpt will appear here.'}
        </p>
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
          <span>{post.date || 'Date'}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readTime || 'Read time'}</span>
        </div>
      </div>
    </div>
  )
}

export function BlogListPreview({ post }: { post: BlogPost }) {
  return (
    <div className="space-y-10 bg-white p-4 sm:p-6">
      <BlogImageSizeAdvice imageUrl={post.image} />
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Featured list layout
        </p>
        <BlogListFeaturedPreview post={post} />
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Grid card layout
        </p>
        <BlogListCardPreview post={post} />
      </div>
    </div>
  )
}

/** Full article as shown on /blog/[slug]. */
export function BlogArticlePreview({ post }: { post: BlogPost }) {
  return (
    <div className="overflow-hidden bg-white">
      <div className="relative h-64 w-full sm:h-80">
        <HeroImage
          src={post.image}
          alt={post.title}
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(18,77,43,0.55)' }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-3xl px-6 pb-10">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#86efac',
              }}
            >
              {post.category || 'Category'}
            </span>
            <h1 className="text-2xl font-bold leading-snug text-white text-balance sm:text-3xl lg:text-4xl">
              {post.title || 'Untitled post'}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
              <span>{post.date || 'Date'}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readTime || 'Read time'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-6 pt-4">
        <BlogImageSizeAdvice imageUrl={post.image} />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <span className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-gray-500">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All posts
        </span>

        <article className="prose prose-gray max-w-none">
          {post.sections.length > 0 ? (
            <SectionBlocks sections={post.sections} />
          ) : (
            <p className="mt-5 text-base text-gray-500">
              No article sections yet.
            </p>
          )}
        </article>

        <div className="mt-14 border-t border-gray-100 pt-10 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#1a6b3c' }}
          >
            Ready to get started?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Talk to an Excel expert today
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-600">
            Book a free discovery call or send us an enquiry. We will assess
            your project and recommend the right approach.
          </p>
        </div>
      </div>
    </div>
  )
}

export type BlogPreviewKind = 'list' | 'article'

export function AdminBlogPreviewShell({
  post,
  kind,
  onKindChange,
  onClose,
  closeLabel,
}: {
  post: BlogPost
  kind: BlogPreviewKind
  onKindChange: (kind: BlogPreviewKind) => void
  onClose: () => void
  closeLabel?: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Blog preview</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Matches the live public layouts. Unsaved edits in the editor are
            included.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md border border-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => onKindChange('list')}
              className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                kind === 'list'
                  ? 'bg-brand text-white'
                  : 'text-ink hover:bg-surface-raised'
              }`}
            >
              List / cards
            </button>
            <button
              type="button"
              onClick={() => onKindChange('article')}
              className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                kind === 'article'
                  ? 'bg-brand text-white'
                  : 'text-ink hover:bg-surface-raised'
              }`}
            >
              Full article
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            {closeLabel ?? 'Back to editor'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        {kind === 'list' ? (
          <BlogListPreview post={post} />
        ) : (
          <BlogArticlePreview post={post} />
        )}
      </div>
    </div>
  )
}
