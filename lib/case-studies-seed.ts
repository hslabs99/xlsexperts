import 'server-only'

/**
 * Seed Firestore `caseStudies` from the frozen archive + optional Storage heroes.
 *
 * Image uploads compress with sharp first (case-study PNGs are ~2MB raw).
 * Local `/images/cs-*.png` paths remain valid if Storage fails.
 *
 * Server-only — never import from Client Components.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import {
  HOME_CASE_STUDIES_LIMIT,
  publishHomeCaseStudiesSnapshot,
  updateCaseStudyFields,
} from '@/lib/case-studies-db'
import {
  formatStorageError,
  uploadCaseStudyImage,
} from '@/lib/case-studies-storage'
import { CASE_STUDIES_COLLECTION, getDb } from '@/lib/firebase'

export type CaseStudySeedResult = {
  archiveCount: number
  created: number
  updated: number
  skipped: number
  imagesUploaded: number
  imagesFailed: number
  imagesSkipped: number
  homePublished: boolean
  lastImageError?: string
  hint?: string
}

/** Resize + JPEG so Storage uploads stay small and reliable. */
export async function compressLocalCaseStudyImage(
  imagePath: string
): Promise<{ bytes: Uint8Array; contentType: string; filename: string }> {
  if (!imagePath.startsWith('/')) {
    throw new Error(`Expected public path, got ${imagePath}`)
  }
  const abs = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''))
  const raw = await readFile(abs)
  const bytes = await sharp(raw)
    .rotate()
    .resize({ width: 1600, height: 1000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer()
  return {
    bytes: new Uint8Array(bytes),
    contentType: 'image/jpeg',
    filename: 'hero.jpg',
  }
}

export async function importLocalCaseStudyImageToStorage(
  slug: string,
  imagePath: string
): Promise<string> {
  const compressed = await compressLocalCaseStudyImage(imagePath)
  return uploadCaseStudyImage(
    slug,
    compressed.bytes,
    compressed.filename,
    compressed.contentType
  )
}

export async function seedCaseStudiesFromArchive(options?: {
  overwrite?: boolean
  uploadImages?: boolean
  publishHome?: boolean
}): Promise<CaseStudySeedResult> {
  const overwrite = Boolean(options?.overwrite)
  const uploadImages = Boolean(options?.uploadImages)
  const publishHome = options?.publishHome !== false

  let created = 0
  let updated = 0
  let skipped = 0
  let imagesUploaded = 0
  let imagesFailed = 0
  let imagesSkipped = 0
  let lastImageError: string | undefined

  for (let i = 0; i < CASE_STUDIES_ARCHIVE.length; i += 1) {
    const item = CASE_STUDIES_ARCHIVE[i]
    const ref = doc(getDb(), CASE_STUDIES_COLLECTION, item.slug)
    const existing = await getDoc(ref)

    if (existing.exists() && !overwrite) {
      skipped += 1
    } else {
      await setDoc(
        ref,
        {
          slug: item.slug,
          client: item.client,
          sector: item.sector,
          title: item.title,
          // Keep local public path; Storage URL replaces this when upload succeeds
          image: item.image,
          problem: item.problem,
          solution: item.solution,
          outcome: item.outcome,
          tags: item.tags,
          published: true,
          showOnHome: i < HOME_CASE_STUDIES_LIMIT,
          homeOrder: i < HOME_CASE_STUDIES_LIMIT ? i : 9999,
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

    const sourcePath = item.localImage
    if (!sourcePath.startsWith('/')) {
      imagesSkipped += 1
      continue
    }

    try {
      const url = await importLocalCaseStudyImageToStorage(item.slug, sourcePath)
      await updateCaseStudyFields(item.slug, { image: url })
      imagesUploaded += 1
    } catch (err) {
      imagesFailed += 1
      lastImageError = formatStorageError(err)
    }
  }

  let homePublished = false
  if (publishHome) {
    await publishHomeCaseStudiesSnapshot()
    homePublished = true
  }

  const hint =
    uploadImages && imagesFailed > 0 && imagesUploaded === 0
      ? 'Firestore + homepage snapshot are fine — heroes still use /images/cs-*.png (works on the site). Storage upload failed for every file: check Firebase Console → Storage (enabled + bucket linked) and Storage Rules (unauthenticated writes must be allowed for admin seed, or use “Push images from browser” after opening Storage). Typical rules fix: allow write for path case-studies/{allPaths=**} while developing.'
      : uploadImages && imagesFailed > 0
        ? 'Some images uploaded. Failures keep the local /images/… path so cards still render.'
        : undefined

  return {
    archiveCount: CASE_STUDIES_ARCHIVE.length,
    created,
    updated,
    skipped,
    imagesUploaded,
    imagesFailed,
    imagesSkipped,
    homePublished,
    lastImageError,
    hint,
  }
}
