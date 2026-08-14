/**
 * Harvest selected Wix blog URLs into draft Firestore `blogPosts`.
 * Progress is recorded on `blog_seed_todo`. Safe to re-run.
 *
 * Image compression uses sharp when available; on Windows/local where sharp
 * fails to load, the raw downloaded image is uploaded instead.
 */

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_POSTS_COLLECTION } from '@/lib/firebase'
import { uploadBlogImageAdmin } from '@/lib/blog-storage-admin'
import {
  getBlogSeedTodo,
  listBlogSeedTodos,
  updateBlogSeedTodo,
} from '@/lib/blog-seed-todo-db'
import { parseWixBlogHtml, wixImageCandidates } from '@/lib/wix-blog-parse'
import { inferCategoryForSlug } from '@/lib/wix-blog-category'
import type {
  BlogSeedHarvestItemResult,
  BlogSeedHarvestResult,
  BlogSeedTodoStatus,
} from '@/lib/blog-seed-todo-shared'

const FETCH_TIMEOUT_MS = 45_000
const USER_AGENT =
  'XLSExpertsBlogHarvester/1.0 (+https://www.xlsexperts.co.nz; local admin seed)'

async function compressHero(raw: Buffer): Promise<{
  bytes: Buffer
  contentType: string
  filename: string
  note?: string
}> {
  try {
    const sharpMod = await import('sharp')
    const sharp = sharpMod.default
    const bytes = await sharp(raw)
      .rotate()
      .resize({
        width: 1600,
        height: 900,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()
    return { bytes, contentType: 'image/jpeg', filename: 'hero.jpg' }
  } catch (err) {
    const note =
      err instanceof Error
        ? `sharp unavailable (${err.message.slice(0, 120)}); uploading original`
        : 'sharp unavailable; uploading original'
    // Detect type from magic bytes when possible
    let contentType = 'image/jpeg'
    let filename = 'hero.jpg'
    if (raw[0] === 0x89 && raw[1] === 0x50) {
      contentType = 'image/png'
      filename = 'hero.png'
    } else if (raw[0] === 0x52 && raw[1] === 0x49) {
      contentType = 'image/webp'
      filename = 'hero.webp'
    }
    return { bytes: raw, contentType, filename, note }
  }
}

async function fetchHtml(
  url: string
): Promise<{ ok: boolean; status: number; html: string; error?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    const html = await res.text()
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        html,
        error: `HTTP ${res.status} fetching source`,
      }
    }
    // Soft 404: Wix sometimes returns 200 with a not-found shell
    if (
      /page not found|doesn't exist|does not exist/i.test(html) &&
      !/data-hook=["']post-description["']/i.test(html)
    ) {
      return {
        ok: false,
        status: 404,
        html,
        error: 'Source page looks like a 404 (no post body)',
      }
    }
    return { ok: true, status: res.status, html }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Timed out fetching source'
          : err.message
        : 'Fetch failed'
    return { ok: false, status: 0, html: '', error: message }
  } finally {
    clearTimeout(timer)
  }
}

async function downloadAndUploadHero(
  slug: string,
  imageUrl: string
): Promise<{ url: string | null; note?: string; tried?: string[] }> {
  if (!imageUrl) return { url: null, note: 'No source hero URL found on Wix page' }

  const candidates = wixImageCandidates(imageUrl)
  const tried: string[] = []
  const errors: string[] = []

  for (const url of candidates) {
    tried.push(url)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*' },
      })
      if (!res.ok) {
        errors.push(`HTTP ${res.status} for ${url.slice(0, 80)}`)
        continue
      }
      const raw = Buffer.from(await res.arrayBuffer())
      if (raw.length < 100) {
        errors.push(`Empty/tiny body (${raw.length}b)`)
        continue
      }

      let toUpload = raw
      let contentType = 'image/jpeg'
      let filename = 'hero.jpg'
      let compressNote: string | undefined

      if (raw.length > 5 * 1024 * 1024) {
        // Must compress — sharp may be unavailable on Windows
        const compressed = await compressHero(raw)
        if (compressed.bytes.length > 5 * 1024 * 1024) {
          errors.push(
            `Still >5MB after compress (${Math.round(compressed.bytes.length / 1024)}KB)`
          )
          continue
        }
        toUpload = compressed.bytes
        contentType = compressed.contentType
        filename = compressed.filename
        compressNote = compressed.note
      } else {
        const compressed = await compressHero(raw)
        toUpload = compressed.bytes
        contentType = compressed.contentType
        filename = compressed.filename
        compressNote = compressed.note
      }

      try {
        const uploaded = await uploadBlogImageAdmin(
          slug,
          toUpload,
          filename,
          contentType
        )
        return {
          url: uploaded,
          note: compressNote
            ? `Uploaded to Storage (${compressNote})`
            : 'Uploaded to Storage',
          tried,
        }
      } catch (uploadErr) {
        errors.push(
          uploadErr instanceof Error
            ? `Storage: ${uploadErr.message}`
            : 'Storage upload failed'
        )
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Download failed')
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    url: null,
    note: `Hero upload failed after ${tried.length} URL(s): ${errors.slice(0, 3).join(' | ')}`,
    tried,
  }
}

async function harvestOne(
  slug: string,
  sourceUrl: string,
  options: {
    overwriteDrafts: boolean
    /** When true, replace existing unpublished drafts even if overwriteDrafts is off */
    forceDraftReimport?: boolean
  }
): Promise<BlogSeedHarvestItemResult> {
  await updateBlogSeedTodo(slug, { markAttempted: true })

  const existingPost = await getAdminDb()
    .collection(BLOG_POSTS_COLLECTION)
    .doc(slug)
    .get()

  if (existingPost.exists) {
    const data = existingPost.data() as Record<string, unknown>
    const published = data.published !== false
    const allowDraftReplace =
      !published &&
      (options.overwriteDrafts || Boolean(options.forceDraftReimport))
    if (!allowDraftReplace) {
      const note = published
        ? 'Slug already exists as a published post — left untouched'
        : 'Slug already exists as a draft — mark as waiting (or enable overwrite drafts) to re-import'
      await updateBlogSeedTodo(slug, {
        status: 'duplicate',
        duplicateNote: note,
        lastError: null,
        lastHttpStatus: null,
        title: typeof data.title === 'string' ? data.title : undefined,
      })
      return {
        slug,
        sourceUrl,
        status: 'duplicate',
        duplicateNote: note,
        title: typeof data.title === 'string' ? data.title : undefined,
      }
    }
  }

  const fetched = await fetchHtml(sourceUrl)
  if (!fetched.ok) {
    await updateBlogSeedTodo(slug, {
      status: 'failed',
      lastError: fetched.error || 'Fetch failed',
      lastHttpStatus: fetched.status || null,
      duplicateNote: null,
    })
    return {
      slug,
      sourceUrl,
      status: 'failed',
      httpStatus: fetched.status,
      error: fetched.error,
    }
  }

  let parsed
  try {
    parsed = parseWixBlogHtml(fetched.html, { slug })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse failed'
    await updateBlogSeedTodo(slug, {
      status: 'failed',
      lastError: message,
      lastHttpStatus: fetched.status,
    })
    return {
      slug,
      sourceUrl,
      status: 'failed',
      httpStatus: fetched.status,
      error: message,
    }
  }

  if (!parsed.sections.length) {
    await updateBlogSeedTodo(slug, {
      status: 'failed',
      lastError: 'Parsed zero content sections from Wix body',
      lastHttpStatus: fetched.status,
      title: parsed.title,
    })
    return {
      slug,
      sourceUrl,
      status: 'failed',
      httpStatus: fetched.status,
      title: parsed.title,
      error: 'Parsed zero content sections from Wix body',
    }
  }

  const category =
    parsed.category || inferCategoryForSlug(slug, parsed.title) || 'Guides'

  let image = ''
  let imageUploaded = false
  let imageNote: string | undefined
  const sourceImageUrl = parsed.imageUrl || undefined
  if (parsed.imageUrl) {
    const uploaded = await downloadAndUploadHero(slug, parsed.imageUrl)
    if (uploaded.url) {
      image = uploaded.url
      imageUploaded = true
      imageNote = uploaded.note
    } else {
      imageNote = uploaded.note
      // Keep a working remote Wix URL so preview still shows something
      image = wixImageCandidates(parsed.imageUrl)[0] || parsed.imageUrl
    }
  } else {
    imageNote = 'No hero image found on Wix page'
  }

  const excerpt =
    parsed.excerpt ||
    parsed.sections.find((s) => s.text)?.text?.slice(0, 220) ||
    parsed.title

  const ref = getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(slug)
  await ref.set(
    {
      slug,
      title: parsed.title,
      author: parsed.author,
      date: parsed.date,
      readTime: parsed.readTime,
      excerpt,
      image,
      category,
      sections: parsed.sections,
      published: false,
      featured: false,
      showNz: true,
      showUsa: true,
      sortOrder: 5000,
      source: 'wix-harvest',
      sourceUrl,
      sourceImageUrl: sourceImageUrl || null,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existingPost.exists
        ? {}
        : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  )

  await updateBlogSeedTodo(slug, {
    status: 'imported',
    title: parsed.title,
    category,
    lastError: imageNote && !imageUploaded ? imageNote : null,
    lastHttpStatus: fetched.status,
    duplicateNote: null,
    markImported: true,
  })

  return {
    slug,
    sourceUrl,
    status: 'imported',
    title: parsed.title,
    category,
    httpStatus: fetched.status,
    imageUploaded,
    imageNote,
    sourceImageUrl,
    sectionCount: parsed.sections.length,
    error: imageNote && !imageUploaded ? imageNote : undefined,
    post: {
      slug,
      title: parsed.title,
      author: parsed.author,
      date: parsed.date,
      readTime: parsed.readTime,
      excerpt,
      image,
      category,
      sections: parsed.sections,
      published: false,
      sourceUrl,
      sourceImageUrl,
    },
  }
}

export async function seedMissingBlogs(options?: {
  slugs?: string[]
  /** When true, replace existing unpublished drafts with the same slug */
  overwriteDrafts?: boolean
}): Promise<BlogSeedHarvestResult> {
  const overwriteDrafts = Boolean(options?.overwriteDrafts)
  const todos = await listBlogSeedTodos()
  const wanted = options?.slugs?.length
    ? new Set(options.slugs.map((s) => s.trim().toLowerCase()).filter(Boolean))
    : null

  const targets = todos.filter((t) => (wanted ? wanted.has(t.slug) : true))

  const items: BlogSeedHarvestItemResult[] = []
  let imported = 0
  let duplicates = 0
  let failed = 0
  let skipped = 0

  for (const todo of targets) {
    if (!todo.sourceUrl) {
      const result: BlogSeedHarvestItemResult = {
        slug: todo.slug,
        sourceUrl: '',
        status: 'skipped',
        error: 'Missing sourceUrl on todo row',
      }
      items.push(result)
      skipped += 1
      await updateBlogSeedTodo(todo.slug, {
        status: 'skipped',
        lastError: result.error,
        markAttempted: true,
      })
      continue
    }

    const forceDraftReimport =
      todo.status === 'pending' || todo.status === 'failed'
    const result = await harvestOne(todo.slug, todo.sourceUrl, {
      overwriteDrafts,
      forceDraftReimport,
    })
    items.push(result)
    if (result.status === 'imported') imported += 1
    else if (result.status === 'duplicate') duplicates += 1
    else if (result.status === 'failed') failed += 1
    else skipped += 1
  }

  if (wanted) {
    for (const slug of wanted) {
      if (items.some((i) => i.slug === slug)) continue
      items.push({
        slug,
        sourceUrl: '',
        status: 'skipped',
        error: 'Slug not found in blog_seed_todo — sync constant first',
      })
      skipped += 1
    }
  }

  return {
    attempted: items.length,
    imported,
    duplicates,
    failed,
    skipped,
    items,
  }
}

export function summarizeHarvest(result: BlogSeedHarvestResult): string {
  return (
    `Harvest → attempted ${result.attempted}, imported ${result.imported}, ` +
    `duplicates ${result.duplicates}, failed ${result.failed}, skipped ${result.skipped}`
  )
}

export type { BlogSeedTodoStatus }
