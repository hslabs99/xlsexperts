'use client'

import { useMemo } from 'react'
import type { BlogPostRecord } from '@/lib/blog-shared'
import {
  blogRoutingDecisions,
  type RegionPatch,
} from '@/lib/blog-decisions'

export function AdminBlogRegionDecisions({
  rows,
  busy,
  onApply,
  onEdit,
  onShowAll,
}: {
  rows: BlogPostRecord[]
  busy: boolean
  onApply: (slug: string, patch: RegionPatch) => void
  onEdit: (post: BlogPostRecord) => void
  onShowAll: () => void
}) {
  const published = useMemo(
    () => rows.filter((row) => row.published),
    [rows]
  )
  const flagged = useMemo(
    () =>
      published
        .map((post) => ({ post, decisions: blogRoutingDecisions(post) }))
        .filter((row) => row.decisions.length > 0),
    [published]
  )
  const actions = flagged.filter((row) =>
    row.decisions.some((item) => item.tone === 'action')
  )
  const confirmOnly = flagged.filter((row) =>
    row.decisions.every((item) => item.tone === 'confirm')
  )

  if (flagged.length === 0) return null

  return (
    <section className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-amber-950">
            {actions.length > 0
              ? `${actions.length} published ${actions.length === 1 ? 'post needs' : 'posts need'} a region decision`
              : 'Region decisions'}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-amber-950">
            Unticking a domain does not delete the article. That domain&apos;s URL
            301s to the primary region, and hreflang stops listing it. Posts on
            one domain only do not emit hreflang.
          </p>
        </div>
        <button
          type="button"
          onClick={onShowAll}
          className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950"
        >
          Show all {flagged.length} in the list
        </button>
      </div>

      {confirmOnly.length > 0 ? (
        <p className="mt-3 text-sm text-amber-950">
          {confirmOnly.length} multi-domain{' '}
          {confirmOnly.length === 1 ? 'post has' : 'posts have'} no saved primary.
          x-default currently assumes NZ when NZ is ticked. Confirming a primary
          does not change which domains the article is on.
        </p>
      ) : null}

      {actions.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {actions.slice(0, 25).map(({ post, decisions }) => (
            <li
              key={post.slug}
              className="rounded-md border border-amber-200 bg-white p-3"
            >
              <button
                type="button"
                className="text-left text-sm font-semibold text-brand hover:underline"
                onClick={() => onEdit(post)}
              >
                {post.title}
              </button>
              <p className="font-mono text-[11px] text-ink-muted">{post.slug}</p>
              <ul className="mt-2 space-y-3">
                {decisions.map((decision) => (
                  <li key={decision.code} className="text-sm text-ink">
                    {decision.recommended ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                        Recommended
                      </p>
                    ) : null}
                    <p>{decision.text}</p>
                    {decision.patch && decision.patchLabel ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onApply(post.slug, decision.patch!)}
                        className={
                          decision.recommended
                            ? 'mt-2 rounded-md bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60'
                            : 'mt-2 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-ink disabled:opacity-60'
                        }
                      >
                        {decision.patchLabel}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
      {actions.length > 25 ? (
        <p className="mt-3 text-xs text-amber-950">
          Showing 25 of {actions.length}. Use the list filter for the rest.
        </p>
      ) : null}
    </section>
  )
}
