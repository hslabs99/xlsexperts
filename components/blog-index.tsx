'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BlogListItem } from '@/lib/types'

const PAGE_SIZE = 10

type Props = {
  posts: BlogListItem[]
}

export function BlogIndexClient({ posts }: Props) {
  const tags = useMemo(() => {
    const set = new Set<string>()
    for (const post of posts) {
      const tag = post.category.trim()
      if (tag) set.add(tag)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'en'))
  }, [posts])

  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    if (!activeTag) return posts
    return posts.filter(
      (p) => p.category.trim().toLowerCase() === activeTag.toLowerCase()
    )
  }, [posts, activeTag])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const featured = visible[0]
  const rest = visible.slice(1)

  function selectTag(tag: string | null) {
    setActiveTag(tag)
    setVisibleCount(PAGE_SIZE)
  }

  if (posts.length === 0) {
    return (
      <p className="px-6 py-20 text-center text-gray-600">
        No blog posts published yet.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#1a6b3c' }}
        >
          Filter by topic
        </p>
        <div
          className="mt-3 flex flex-wrap gap-1.5"
          role="listbox"
          aria-label="Blog topics"
        >
          <TagChip
            label="All"
            selected={activeTag === null}
            onClick={() => selectTag(null)}
          />
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={activeTag === tag}
              onClick={() => selectTag(tag)}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Showing {visible.length} of {filtered.length}
          {activeTag ? ` in “${activeTag}”` : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-600">
          No posts in this topic yet. Try another tag.
        </p>
      ) : (
        <>
          {featured ? (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-14 grid gap-8 overflow-hidden border border-gray-200 bg-white transition-shadow hover:shadow-md lg:grid-cols-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized={featured.image.startsWith('http')}
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
                <p className="mt-4 text-base leading-relaxed text-gray-600 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                  <span>{featured.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </Link>
          ) : null}

          {rest.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, index) => (
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
                      loading={index < 2 ? 'eager' : 'lazy'}
                      unoptimized={post.image.startsWith('http')}
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
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-gray-500">
                      <span>{post.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {hasMore ? (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((n) => Math.min(n + PAGE_SIZE, filtered.length))
                }
                className="inline-flex h-11 items-center rounded-lg border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
              >
                Load more
                <span className="ml-2 font-normal text-gray-500">
                  ({filtered.length - visible.length} left)
                </span>
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function TagChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
        selected
          ? 'text-white'
          : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
      }`}
      style={
        selected
          ? { backgroundColor: '#1a6b3c' }
          : undefined
      }
    >
      {label}
    </button>
  )
}
