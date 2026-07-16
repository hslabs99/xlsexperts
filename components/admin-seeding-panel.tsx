'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminBookingSeedPanel } from '@/components/admin-booking-seed-panel'
import { AdminDialog } from '@/components/admin-dialog'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import {
  formatStorageError,
  uploadCaseStudyImage,
} from '@/lib/case-studies-storage'
import { importSiteImageToStorage } from '@/lib/blog-storage'
import type { BlogPostRecord } from '@/lib/blog-shared'
import type { BookingSlot, SeedTemplateConfig } from '@/lib/booking-slots'

type PendingConfirm =
  | { kind: 'blog-overwrite' }
  | { kind: 'blog-seed-images' }
  | null

/**
 * Admin-only one-time / maintenance seed tools.
 * Kept off Blog, Case Studies, Bookings, and Email tabs so marketing staff
 * are not shown archive import controls.
 */
export function AdminSeedingPanel() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [pending, setPending] = useState<PendingConfirm>(null)

  const loadSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/booking-slots')
      const data = (await res.json()) as {
        ok?: boolean
        items?: BookingSlot[]
      }
      if (res.ok && data.ok && Array.isArray(data.items)) {
        setSlots(data.items)
      }
    } catch {
      // non-fatal — seed panel still works
    }
  }, [])

  useEffect(() => {
    void loadSlots()
  }, [loadSlots])

  async function seedBlogs(overwrite: boolean, uploadImages = false) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/seed-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overwrite, uploadImages }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        created?: number
        updated?: number
        skipped?: number
        archiveCount?: number
        imagesUploaded?: number
        imagesFailed?: number
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Blog seed failed')
      }
      setMessage(
        `Blog seed (${data.archiveCount} archive posts) → created ${data.created}, updated ${data.updated}, skipped ${data.skipped}` +
          (uploadImages
            ? `; images ${data.imagesUploaded} uploaded, ${data.imagesFailed} failed.`
            : '.')
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blog seed failed')
    } finally {
      setBusy(false)
    }
  }

  async function pushBlogImages() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/blogs')
      const data = (await res.json()) as {
        ok?: boolean
        items?: BlogPostRecord[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load blog posts')
      }
      let uploaded = 0
      let failed = 0
      for (const post of data.items) {
        if (!post.image.startsWith('/')) continue
        const url = await importSiteImageToStorage(post.slug, post.image)
        if (!url) {
          failed += 1
          continue
        }
        const patchRes = await fetch('/api/admin/blogs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: post.slug, image: url }),
        })
        const patchData = (await patchRes.json()) as {
          ok?: boolean
          error?: string
        }
        if (!patchRes.ok || !patchData.ok) {
          failed += 1
          continue
        }
        uploaded += 1
      }
      setMessage(
        `Blog image Storage upload finished: ${uploaded} uploaded, ${failed} failed/skipped.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blog image push failed')
    } finally {
      setBusy(false)
    }
  }

  async function seedCaseStudies(uploadImages: boolean) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/seed-case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overwrite: true,
          uploadImages,
          publishHome: true,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        created?: number
        updated?: number
        skipped?: number
        imagesUploaded?: number
        imagesFailed?: number
        homePublished?: boolean
        lastImageError?: string
        hint?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Case study seed failed')
      }
      const summary = `Case studies → created ${data.created ?? 0}, updated ${data.updated ?? 0}, skipped ${data.skipped ?? 0}. Images uploaded ${data.imagesUploaded ?? 0}, failed ${data.imagesFailed ?? 0}.${data.lastImageError ? ` Last image error: ${data.lastImageError}` : ''} Homepage snapshot: ${data.homePublished ? 'yes' : 'no'}.`
      setMessage(data.hint ? `${summary} — ${data.hint}` : summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Case study seed failed')
    } finally {
      setBusy(false)
    }
  }

  async function pushCaseStudyImagesFromBrowser() {
    setBusy(true)
    setError(null)
    setMessage(null)
    let uploaded = 0
    let failed = 0
    let lastErr: string | undefined
    try {
      const listRes = await fetch('/api/admin/case-studies')
      const listData = (await listRes.json()) as {
        ok?: boolean
        items?: { slug: string }[]
      }
      const existing = new Set(
        (listData.items ?? []).map((r) => r.slug).filter(Boolean)
      )

      for (const item of CASE_STUDIES_ARCHIVE) {
        try {
          const res = await fetch(item.localImage)
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} for ${item.localImage}`)
          }
          const blob = await res.blob()
          const bytes = new Uint8Array(await blob.arrayBuffer())
          const url = await uploadCaseStudyImage(
            item.slug,
            bytes,
            'hero.png',
            blob.type || 'image/png'
          )
          if (existing.has(item.slug)) {
            const patchRes = await fetch('/api/admin/case-studies', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: item.slug, image: url }),
            })
            const patchData = (await patchRes.json()) as {
              ok?: boolean
              error?: string
            }
            if (!patchRes.ok || !patchData.ok) {
              throw new Error(patchData.error || 'Failed to update image URL')
            }
          } else {
            const createRes = await fetch('/api/admin/case-studies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slug: item.slug,
                client: item.client,
                sector: item.sector,
                title: item.title,
                image: url,
                problem: item.problem,
                solution: item.solution,
                outcome: item.outcome,
                tags: item.tags,
                published: true,
                showOnHome: false,
                homeOrder: 9999,
                sortOrder: 9999,
              }),
            })
            const createData = (await createRes.json()) as {
              ok?: boolean
              error?: string
            }
            if (!createRes.ok || !createData.ok) {
              throw new Error(createData.error || 'Failed to save case study')
            }
          }
          uploaded += 1
        } catch (err) {
          failed += 1
          lastErr = formatStorageError(err)
        }
      }
      await fetch('/api/admin/case-studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish-home' }),
      })
      setMessage(
        `Case study browser push → ${uploaded} uploaded, ${failed} failed.${lastErr ? ` Last error: ${lastErr}` : ''}`
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Case study image push failed'
      )
    } finally {
      setBusy(false)
    }
  }

  async function publishEmailThumbs() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/publish-email-case-study-thumbs', {
        method: 'POST',
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        uploaded?: number
        failed?: number
        lastError?: string
        hint?: string
      }
      if (!res.ok || data.ok === false) {
        throw new Error(
          data.error ||
            data.lastError ||
            'Failed to publish email thumbs to Storage'
        )
      }
      setMessage(
        `Email thumbs → uploaded ${data.uploaded ?? 0}, failed ${data.failed ?? 0}.${data.lastError ? ` Last error: ${data.lastError}` : ''}${data.hint ? ` — ${data.hint}` : ''}`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email thumbs publish failed')
    } finally {
      setBusy(false)
    }
  }

  async function seedEmailDefaults() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        created?: number
        skipped?: number
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Email template seed failed')
      }
      setMessage(
        `Email templates → seeded ${data.created ?? 0}; skipped ${data.skipped ?? 0} existing kind(s).`
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Email template seed failed'
      )
    } finally {
      setBusy(false)
    }
  }

  async function seedBookingSlots(config: SeedTemplateConfig) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed', config }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        created?: number
        skipped?: number
        planned?: number
        error?: string
      }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Booking seed failed')
      setMessage(
        `Booking slots → seeded ${data.created ?? 0}; skipped ${data.skipped ?? 0} (${data.planned ?? 0} planned).`
      )
      await loadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking seed failed')
    } finally {
      setBusy(false)
    }
  }

  async function normalizeBookingDurations() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'normalize-durations' }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        updated?: number
        total?: number
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not normalize slot durations')
      }
      const updated = data.updated ?? 0
      const total = data.total ?? 0
      setMessage(
        updated === 0
          ? `All ${total} booking slot${total === 1 ? '' : 's'} are already 30 minutes.`
          : `Normalized ${updated} of ${total} slot${total === 1 ? '' : 's'} to 30 minutes.`
      )
      await loadSlots()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not normalize slot durations'
      )
    } finally {
      setBusy(false)
    }
  }

  async function clearAllBookingSlots() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-all' }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        deleted?: number
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not empty booking slots')
      }
      const deleted = data.deleted ?? 0
      setMessage(
        deleted === 0
          ? 'Booking slots were already empty.'
          : `Global reset: deleted ${deleted} booking slot${deleted === 1 ? '' : 's'}.`
      )
      await loadSlots()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not empty booking slots'
      )
    } finally {
      setBusy(false)
    }
  }

  async function runPendingConfirm() {
    if (pending?.kind === 'blog-overwrite') {
      setPending(null)
      await seedBlogs(true)
      return
    }
    if (pending?.kind === 'blog-seed-images') {
      setPending(null)
      await seedBlogs(false, true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Seeding</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Admin-only maintenance tools for archive import and Storage push.
          Day-to-day Blog, Case Studies, Bookings, and Email tabs stay clear for
          marketing. Prefer re-running only when you intentionally rebuild data.
        </p>

        {(message || error) && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
            role="status"
          >
            {error || message}
          </div>
        )}
      </div>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-ink">Blog</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Source: frozen v0 archive in{' '}
          <code className="text-xs">lib/blog-posts.ts</code> → Firestore{' '}
          <code className="text-xs">blogPosts</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void seedBlogs(false)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
          >
            Seed from v0 archive
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPending({ kind: 'blog-overwrite' })}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
          >
            Re-seed (overwrite)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPending({ kind: 'blog-seed-images' })}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
          >
            Seed + push images
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void pushBlogImages()}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
          >
            Push images to Storage
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-ink">Case studies</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Source: archive → Firestore <code className="text-xs">caseStudies</code>{' '}
          (+ optional Storage heroes / email thumbs).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void seedCaseStudies(false)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            title="Writes Firestore + homepage snapshot. Keeps /images/cs-*.png paths."
          >
            Seed from archive
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void seedCaseStudies(true)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            title="Also uploads compressed JPEGs to Storage via the API route"
          >
            Seed + upload images (API)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void pushCaseStudyImagesFromBrowser()}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            title="Uploads /images/cs-*.png from this browser into Storage"
          >
            Push images from browser
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void publishEmailThumbs()}
            className="rounded-md border border-brand/40 bg-white px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-light disabled:opacity-60"
            title="Compress 6 heroes → Storage email/case-studies/*.jpg for discovery emails"
          >
            Publish email thumbs (Storage)
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-ink">Email templates</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Create default standard / discovery template kind documents if missing.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void seedEmailDefaults()}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
          >
            Seed defaults
          </button>
        </div>
      </section>

      <AdminBookingSeedPanel
        busy={busy}
        slots={slots}
        onSeed={seedBookingSlots}
        onNormalizeDurations={normalizeBookingDurations}
        onClearAll={clearAllBookingSlots}
      />

      <AdminDialog
        open={pending != null}
        title={
          pending?.kind === 'blog-overwrite'
            ? 'Overwrite blog posts?'
            : 'Seed blog and push images?'
        }
        mode="confirm"
        tone={pending?.kind === 'blog-overwrite' ? 'danger' : 'default'}
        confirmLabel={
          pending?.kind === 'blog-overwrite' ? 'Overwrite' : 'Seed + push'
        }
        busy={busy}
        onClose={() => {
          if (!busy) setPending(null)
        }}
        onConfirm={runPendingConfirm}
      >
        {pending?.kind === 'blog-overwrite' ? (
          <p>
            Overwrite existing Firebase posts with the frozen v0 archive
            copies? Local archive files are not deleted.
          </p>
        ) : (
          <p>
            Upload hero images from public/images into Firebase Storage and
            update post URLs?
          </p>
        )}
      </AdminDialog>
    </div>
  )
}
