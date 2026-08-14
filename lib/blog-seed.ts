/**
 * Seed / re-import helpers for the immutable v0 blog archive.
 *
 * Source: `lib/blog-posts.ts` + `public/images/blog-*.png` (seed input only)
 * Target: Firestore `blogPosts` + Firebase Storage heroes
 *
 * Used by:
 * - `scripts/seed-blogs-from-v0.ts` (CLI)
 * - `POST /api/admin/seed-blogs` (Admin → Seeding)
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_POSTS_COLLECTION } from '@/lib/firebase'
import { blogPosts as v0BlogPosts } from '@/lib/blog-posts'
import { uploadBlogImageAdmin } from '@/lib/blog-storage-admin'
import { updateBlogPostFields } from '@/lib/blog-db'

export type BlogSeedResult = {
  archiveCount: number
  created: number
  updated: number
  skipped: number
  imagesUploaded: number
  imagesFailed: number
  imagesSkipped: number
  lastImageError?: string
}

export function getV0BlogArchive() {
  return v0BlogPosts
}

/**
 * Push every v0 archive post into Firestore.
 * Never deletes archive files. Only writes Firebase documents / Storage objects.
 */
export async function seedBlogPostsFromV0Archive(options?: {
  overwrite?: boolean
  uploadImages?: boolean
}): Promise<BlogSeedResult> {
  const overwrite = Boolean(options?.overwrite)
  const uploadImages = Boolean(options?.uploadImages)

  let created = 0
  let updated = 0
  let skipped = 0
  let imagesUploaded = 0
  let imagesFailed = 0
  let imagesSkipped = 0
  let lastImageError: string | undefined

  for (let i = 0; i < v0BlogPosts.length; i += 1) {
    const post = v0BlogPosts[i]
    const ref = getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(post.slug)
    const existing = await ref.get()

    if (existing.exists && !overwrite) {
      skipped += 1
    } else {
      await ref.set(
        {
          ...post,
          published: true,
          featured: i === 0,
          showNz: true,
          showUsa: true,
          sortOrder: i,
          updatedAt: FieldValue.serverTimestamp(),
          ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        },
        { merge: true }
      )
      if (existing.exists) updated += 1
      else created += 1
    }

    if (!uploadImages) continue

    // Prefer local archive path so we can replace Firestore /images/... with Storage URLs.
    const sourcePath = post.image.startsWith('/')
      ? post.image
      : String(existing.data()?.image ?? '')

    if (!sourcePath.startsWith('/')) {
      imagesSkipped += 1
      continue
    }

    try {
      const url = await importLocalPublicImageToStorage(post.slug, sourcePath)
      if (!url) {
        imagesFailed += 1
        lastImageError = `No URL returned for ${sourcePath}`
        continue
      }
      await updateBlogPostFields(post.slug, { image: url })
      imagesUploaded += 1
    } catch (err) {
      imagesFailed += 1
      lastImageError =
        err instanceof Error ? err.message : 'Image upload failed'
    }
  }

  return {
    archiveCount: v0BlogPosts.length,
    created,
    updated,
    skipped,
    imagesUploaded,
    imagesFailed,
    imagesSkipped,
    lastImageError,
  }
}

/**
 * Read a file under `public/` (seed source only), compress, upload to Storage.
 */
export async function importLocalPublicImageToStorage(
  slug: string,
  imagePath: string
): Promise<string | null> {
  if (!imagePath.startsWith('/')) return null
  const abs = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''))
  const raw = await readFile(abs)
  const bytes = await sharp(raw)
    .rotate()
    .resize({ width: 1600, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
  return uploadBlogImageAdmin(
    slug,
    bytes,
    'hero.jpg',
    'image/jpeg'
  )
}
