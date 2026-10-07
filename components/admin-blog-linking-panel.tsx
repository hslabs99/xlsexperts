'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  blogRegionKey,
  blogRegionLabel,
  blogsCanLinkRegions,
} from '@/lib/blog-shared'
import {
  blogLinkKey,
  linkedSlugs,
  normalizeBlogLinkPair,
  rankBlogLinkCandidates,
  type BlogLinkGraph,
  type BlogLinkPair,
} from '@/lib/blog-links'

type RightView = 'current' | 'suggested'
type LeftRegion = 'all' | 'nz' | 'uk' | 'intl'
type LeftLinkFilter = 'all' | 'linked' | 'unlinked'

const LEFT_REGIONS: { id: LeftRegion; label: string }[] = [
  { id: 'all', label: 'All regions' },
  { id: 'nz', label: 'NZ' },
  { id: 'uk', label: 'UK' },
  { id: 'intl', label: 'International' },
]

/**
 * Left-hand list.
 * NZ and UK are single-country posts. International is the generic set
 * (shown on NZ, UK, and the international site together).
 */
function matchesRegion(
  post: { showNz: boolean; showUsa: boolean; showUk: boolean },
  region: LeftRegion
) {
  if (region === 'all') return true
  const key = blogRegionKey(post)
  if (region === 'intl') return key === 'nz+intl+uk'
  return key === region
}

type LinkPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  published: boolean
  showNz: boolean
  showUsa: boolean
  showUk: boolean
}

const EMPTY_GRAPH: BlogLinkGraph = { links: [], suggestions: [] }
const SHORTLIST_LIMIT = 12

function matches(post: LinkPost, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [post.title, post.excerpt, post.category, post.slug]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export function AdminBlogLinkingPanel() {
  const [posts, setPosts] = useState<LinkPost[]>([])
  const [graph, setGraph] = useState<BlogLinkGraph>(EMPTY_GRAPH)
  const [leftQuery, setLeftQuery] = useState('')
  const [leftLinkFilter, setLeftLinkFilter] = useState<LeftLinkFilter>('unlinked')
  const [leftRegion, setLeftRegion] = useState<LeftRegion>('all')
  const [rightQuery, setRightQuery] = useState('')
  const [rightView, setRightView] = useState<RightView>('suggested')
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [postsRes, linksRes] = await Promise.all([
        fetch('/api/admin/blogs'),
        fetch('/api/admin/blog-links'),
      ])
      const postsData = (await postsRes.json()) as {
        ok?: boolean
        error?: string
        items?: LinkPost[]
      }
      const linksData = (await linksRes.json()) as {
        ok?: boolean
        error?: string
        graph?: BlogLinkGraph
      }
      if (!postsRes.ok || !postsData.ok) {
        throw new Error(postsData.error || 'Failed to load blogs')
      }
      if (!linksRes.ok || !linksData.ok || !linksData.graph) {
        throw new Error(linksData.error || 'Failed to load links')
      }
      setPosts(
        (postsData.items ?? []).map((post) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt ?? '',
          category: post.category ?? '',
          published: post.published !== false,
          showNz: post.showNz !== false,
          showUsa: post.showUsa !== false,
          showUk: post.showUk !== false,
        }))
      )
      setGraph(linksData.graph)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog linking')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const active = posts.find((post) => post.slug === activeSlug) ?? null
  const linked = useMemo(
    () => new Set(active ? linkedSlugs(graph, active.slug) : []),
    [graph, active]
  )

  const linkCountBySlug = useMemo(() => {
    const known = new Set(posts.map((post) => post.slug))
    const counts = new Map<string, number>()
    for (const post of posts) {
      const count = linkedSlugs(graph, post.slug).filter((slug) => known.has(slug)).length
      counts.set(post.slug, count)
    }
    return counts
  }, [posts, graph])

  const leftPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (!matches(post, leftQuery)) return false
        const count = linkCountBySlug.get(post.slug) ?? 0
        if (leftLinkFilter === 'linked' && count === 0) return false
        if (leftLinkFilter === 'unlinked' && count > 0) return false
        return matchesRegion(post, leftRegion)
      }),
    [posts, leftQuery, leftLinkFilter, leftRegion, linkCountBySlug]
  )

  const leftRegionCounts = useMemo(() => {
    const counts: Record<LeftRegion, number> = { all: 0, nz: 0, uk: 0, intl: 0 }
    for (const post of posts) {
      const count = linkCountBySlug.get(post.slug) ?? 0
      if (leftLinkFilter === 'linked' && count === 0) continue
      if (leftLinkFilter === 'unlinked' && count > 0) continue
      if (!matches(post, leftQuery)) continue
      counts.all += 1
      const key = blogRegionKey(post)
      if (key === 'nz') counts.nz += 1
      else if (key === 'uk') counts.uk += 1
      else if (key === 'nz+intl+uk') counts.intl += 1
    }
    return counts
  }, [posts, leftLinkFilter, leftQuery, linkCountBySlug])

  const leftCounts = useMemo(() => {
    let linkedCount = 0
    for (const count of linkCountBySlug.values()) {
      if (count > 0) linkedCount += 1
    }
    return {
      all: posts.length,
      linked: linkedCount,
      unlinked: posts.length - linkedCount,
    }
  }, [posts.length, linkCountBySlug])

  const shortlist = useMemo(() => {
    if (!active) return []
    const ranked = rankBlogLinkCandidates(active, posts)
    const scoreFor = new Map(ranked.map((row) => [row.slug, row.score]))
    const bySlug = new Map(posts.map((post) => [post.slug, post]))

    if (rightView === 'current') {
      return [...linked]
        .map((slug) => bySlug.get(slug))
        .filter((post): post is LinkPost => Boolean(post))
        .filter((post) => matches(post, rightQuery))
        .map((post) => ({
          post,
          score: scoreFor.get(post.slug) ?? 0,
          linked: true,
          sameRegion: blogsCanLinkRegions(active, post),
        }))
    }

    const sameRegion = posts.filter(
      (post) =>
        post.slug !== active.slug &&
        !linked.has(post.slug) &&
        blogsCanLinkRegions(active, post) &&
        matches(post, rightQuery)
    )
    const rows = sameRegion
      .map((post) => ({
        post,
        score: scoreFor.get(post.slug) ?? 0,
        linked: false,
        sameRegion: true,
      }))
      .filter((row) => (rightQuery.trim() ? true : row.score > 0))
      .sort((a, b) => b.score - a.score || a.post.title.localeCompare(b.post.title))

    return rightQuery.trim() ? rows : rows.slice(0, SHORTLIST_LIMIT)
  }, [active, posts, linked, rightQuery, rightView])

  async function persist(nextLinks: BlogLinkPair[], note: string) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/blog-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: nextLinks, suggestions: [] }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        graph?: BlogLinkGraph
      }
      if (!res.ok || !data.ok || !data.graph) {
        throw new Error(data.error || 'Failed to save links')
      }
      setGraph(data.graph)
      setPicked(new Set())
      setMessage(note)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save links')
    } finally {
      setBusy(false)
    }
  }

  function selectLeft(slug: string) {
    setActiveSlug(slug)
    setPicked(new Set())
    setRightQuery('')
    setRightView('suggested')
    setMessage(null)
  }

  function delinkOne(slug: string) {
    if (!active) return
    const key = blogLinkKey(active.slug, slug)
    void persist(
      graph.links.filter((pair) => blogLinkKey(pair.a, pair.b) !== key),
      'Link removed from both blogs.'
    )
  }

  function togglePicked(slug: string) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function createLinks() {
    if (!active) return
    const additions: BlogLinkPair[] = []
    for (const slug of picked) {
      if (linked.has(slug)) continue
      const other = posts.find((post) => post.slug === slug)
      if (!other || !blogsCanLinkRegions(active, other)) continue
      const pair = normalizeBlogLinkPair(active.slug, slug)
      if (pair) additions.push(pair)
    }
    if (additions.length === 0) {
      setMessage('Select one or more blogs that are not linked yet.')
      return
    }
    void persist(
      [...graph.links, ...additions],
      additions.length === 1
        ? 'Link saved both ways. Each blog lists the other under See other blogs of interest.'
        : `${additions.length} links saved both ways.`
    )
  }

  function removeLinks() {
    if (!active) return
    const drop = new Set<string>()
    for (const slug of picked) {
      if (!linked.has(slug)) continue
      drop.add(blogLinkKey(active.slug, slug))
    }
    if (drop.size === 0) {
      setMessage('Select one or more blogs that are already linked.')
      return
    }
    void persist(
      graph.links.filter((pair) => !drop.has(blogLinkKey(pair.a, pair.b))),
      drop.size === 1
        ? 'Link removed from both blogs.'
        : `${drop.size} links removed from both blogs.`
    )
  }

  const pickedLinked = [...picked].filter((slug) => linked.has(slug)).length
  const pickedNew = picked.size - pickedLinked

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Blog linking</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          Pick a blog on the left. Suggested links on the right stay in the same
          region: NZ only with NZ, UK only with UK, US only with US, and generic
          posts only with other generic posts. Current links can be removed
          even when an older link crossed regions.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-brand/30 bg-brand-light px-3 py-2 text-sm text-brand-dark">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading blogs…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="min-w-0">
            <div className="mb-2 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['unlinked', 'No links'],
                    ['linked', 'Has links'],
                    ['all', 'All'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLeftLinkFilter(id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                      leftLinkFilter === id
                        ? 'bg-brand text-white'
                        : 'border border-border bg-white text-ink'
                    }`}
                  >
                    {label} ({leftCounts[id]})
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filter the left-hand blog list by region">
                {LEFT_REGIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLeftRegion(id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      leftRegion === id
                        ? 'bg-ink text-white'
                        : 'border border-border bg-white text-ink'
                    }`}
                  >
                    {label} ({leftRegionCounts[id]})
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Blogs</span>
                <input
                  value={leftQuery}
                  onChange={(e) => setLeftQuery(e.target.value)}
                  placeholder="Filter by keyword"
                  className="rounded-md border border-border bg-white px-3 py-2"
                />
              </label>
            </div>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {leftPosts.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-white px-3 py-6 text-sm text-ink-muted">
                  No blogs on the left match{' '}
                  {LEFT_REGIONS.find((item) => item.id === leftRegion)?.label ?? 'this region'}.
                </p>
              ) : null}
              {leftPosts.map((post) => {
                const count = linkCountBySlug.get(post.slug) ?? 0
                const selected = activeSlug === post.slug
                return (
                  <button
                    key={post.slug}
                    type="button"
                    onClick={() => selectLeft(post.slug)}
                    className={`block w-full rounded-md border bg-white p-3 text-left ${
                      selected ? 'border-brand ring-2 ring-brand' : 'border-border'
                    }`}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{post.title}</span>
                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold text-ink">
                        {blogRegionLabel(post)}
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-900">
                        Current links {count}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-4 block text-xs leading-5 text-ink-muted">
                      {post.excerpt || 'No excerpt yet.'}
                    </span>
                    {post.published ? null : (
                      <span className="mt-1 block text-[11px] text-ink-muted">Draft</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!active}
                    onClick={() => {
                      setRightView('current')
                      setPicked(new Set())
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                      rightView === 'current'
                        ? 'bg-brand text-white'
                        : 'border border-border bg-white text-ink'
                    }`}
                  >
                    Current links{active ? ` (${linkCountBySlug.get(active.slug) ?? 0})` : ''}
                  </button>
                  <button
                    type="button"
                    disabled={!active}
                    onClick={() => {
                      setRightView('suggested')
                      setPicked(new Set())
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                      rightView === 'suggested'
                        ? 'bg-brand text-white'
                        : 'border border-border bg-white text-ink'
                    }`}
                  >
                    Suggested links
                  </button>
                </div>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">
                    {active
                      ? `${blogRegionLabel(active)} · ${active.title}`
                      : 'Pick a blog on the left'}
                  </span>
                  <input
                    value={rightQuery}
                    onChange={(e) => setRightQuery(e.target.value)}
                    disabled={!active}
                    placeholder={
                      rightView === 'current'
                        ? 'Filter current links'
                        : 'Search this region'
                    }
                    className="rounded-md border border-border bg-white px-3 py-2 disabled:bg-surface-raised"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !active || pickedNew === 0}
                  onClick={createLinks}
                  className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Link selected{pickedNew > 0 ? ` (${pickedNew})` : ''}
                </button>
                <button
                  type="button"
                  disabled={busy || !active || pickedLinked === 0}
                  onClick={removeLinks}
                  className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 disabled:opacity-60"
                >
                  Remove selected{pickedLinked > 0 ? ` (${pickedLinked})` : ''}
                </button>
              </div>
            </div>

            {!active ? (
              <p className="rounded-md border border-dashed border-border bg-white px-3 py-6 text-sm text-ink-muted">
                Click a blog on the left, then choose current links or suggestions.
              </p>
            ) : shortlist.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-white px-3 py-6 text-sm text-ink-muted">
                {rightView === 'current'
                  ? 'No current links match this region.'
                  : 'No suggested links match this region.'}
              </p>
            ) : (
              <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                {shortlist.map(({ post, score, linked: isLinked, sameRegion }) => {
                  const checked = picked.has(post.slug)
                  return (
                    <label
                      key={post.slug}
                      className={`flex cursor-pointer gap-3 rounded-md border bg-white p-3 ${
                        checked ? 'border-brand ring-2 ring-brand' : 'border-border'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => togglePicked(post.slug)}
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {post.title}
                          </span>
                          <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold text-ink">
                            {blogRegionLabel(post)}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                              isLinked
                                ? sameRegion
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-950'
                            }`}
                          >
                            {isLinked
                              ? sameRegion
                                ? 'Linked'
                                : 'Linked across regions'
                              : 'Suggested'}
                          </span>
                          {rightView === 'suggested' ? (
                            <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold text-ink">
                              Score {score}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 line-clamp-4 block text-xs leading-5 text-ink-muted">
                          {post.excerpt || 'No excerpt yet.'}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                          <span>
                            {rightView === 'current'
                              ? sameRegion
                                ? 'Same region'
                                : 'Different region — remove this link'
                              : score === 0
                                ? 'Same region, no topic overlap'
                                : 'Title matches count as 3, other shared words as 1'}
                            {post.published ? '' : ' · draft'}
                          </span>
                          {isLinked ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                delinkOne(post.slug)
                              }}
                              className="rounded border border-red-300 px-2 py-0.5 font-semibold text-red-800 disabled:opacity-60"
                            >
                              Delink
                            </button>
                          ) : null}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
