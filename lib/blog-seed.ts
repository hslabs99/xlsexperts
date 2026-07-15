/**
 * Seed / re-import helpers for the immutable v0 blog archive.
 *
 * Source: `lib/blog-posts.ts` + `public/images/blog-*.png`
 * Target: Firestore `blogPosts` (+ optional Firebase Storage heroes)
 *
 * Used by:
 * - `scripts/seed-blogs-from-v0.ts` (CLI)
 * - `POST /api/admin/seed-blogs` (Admin → Blog)
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { BLOG_POSTS_COLLECTION, getDb } from '@/lib/firebase'
import { blogPosts as v0BlogPosts } from '@/lib/blog-posts'
import { uploadBlogImage } from '@/lib/blog-storage'
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
 * Never deletes archive files. Only writes Firebase documents.
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
    const ref = doc(getDb(), BLOG_POSTS_COLLECTION, post.slug)
    const existing = await getDoc(ref)

    if (existing.exists() && !overwrite) {
      skipped += 1
    } else {
      await setDoc(
        ref,
        {
          ...post,
          published: true,
          featured: i === 0,
          sortOrder: i,
          updatedAt: serverTimestamp(),
          ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      )
      if (existing.exists()) updated += 1
      else created += 1
    }

    if (!uploadImages) continue

    // Always prefer the local v0 archive path when uploading so we can push
    // cloud URLs even if Firestore still points at /images/...
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
      // Continue seeding remaining posts — Storage may be disabled on the project.
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
 * Read a file under `public/` (e.g. `/images/blog-foo.png`) and upload to Storage.
 * Used by the CLI/API seed so we do not depend on a running HTTP server.
 */
export async function importLocalPublicImageToStorage(
  slug: string,
  imagePath: string
): Promise<string | null> {
  if (!imagePath.startsWith('/')) return null
  const abs = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''))
  const buf = await readFile(abs)
  const ext =
    imagePath.split('.').pop()?.split('?')[0]?.replace(/[^\w]+/g, '') || 'png'
  const contentType =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'gif'
          ? 'image/gif'
          : 'image/png'
  const blob = new Blob([new Uint8Array(buf)], { type: contentType })
  return uploadBlogImage(slug, blob, `hero.${ext}`)
}
