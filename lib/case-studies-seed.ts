/**
 * Seed Firestore `caseStudies` from the frozen archive + Firebase Storage heroes.
 *
 * Seed input: `public/images/cs-*.png` (local archive only).
 * Runtime: Storage download URLs written into Firestore.
 * Server/CLI only — do not import from Client Components.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { FieldValue } from 'firebase-admin/firestore'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import {
  HOME_CASE_STUDIES_LIMIT,
  publishHomeCaseStudiesSnapshot,
  stripArchivedServiceSlugsFromCms,
  updateCaseStudyFields,
} from '@/lib/case-studies-db'
import { uploadCaseStudyImageAdmin } from '@/lib/case-studies-storage-admin'
import { getAdminDb } from '@/lib/firebase-admin'
import { CASE_STUDIES_COLLECTION } from '@/lib/firebase'

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

/** Centre-crop to card size + JPEG for Storage. */
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
    .resize(900, 300, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80, mozjpeg: true })
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
  return uploadCaseStudyImageAdmin(
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
    const ref = getAdminDb().collection(CASE_STUDIES_COLLECTION).doc(item.slug)
    const existing = await ref.get()

    if (existing.exists && !overwrite) {
      skipped += 1
    } else {
      await ref.set(
        {
          slug: item.slug,
          client: item.client,
          sector: item.sector,
          title: item.title,
          image: item.image,
          problem: item.problem,
          solution: item.solution,
          outcome: item.outcome,
          tags: item.tags,
          published: true,
          showOnHome: i < HOME_CASE_STUDIES_LIMIT,
          homeOrder: i < HOME_CASE_STUDIES_LIMIT ? i : 9999,
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
      lastImageError =
        err instanceof Error ? err.message : 'Image upload failed'
    }
  }

  let homePublished = false
  if (publishHome) {
    await publishHomeCaseStudiesSnapshot()
    homePublished = true
  }

  await stripArchivedServiceSlugsFromCms()

  const hint =
    uploadImages && imagesFailed > 0 && imagesUploaded === 0
      ? 'Storage upload failed for every file. Confirm bucket xlsexperts-49c22.firebasestorage.app exists and ADC can write to it.'
      : uploadImages && imagesFailed > 0
        ? 'Some images uploaded; failed ones still have local /images/… paths until re-run.'
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
