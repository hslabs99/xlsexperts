import { randomUUID } from 'node:crypto'
import { getAdminStorage } from '@/lib/firebase-admin'

/**
 * Cloud-only image storage via Firebase Admin.
 * Do not write images to disk / public/ — uploads go straight to the bucket.
 * Server/CLI only — do not import from Client Components.
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export type SiteImageFolder =
  | 'blog'
  | 'case-studies'
  | 'email/case-studies'
  | 'client-logos'
  | 'hero-clients'
  | 'hero-projects'

export type UploadImageInput = File | Blob | Uint8Array | Buffer

function extensionFor(type: string): string {
  if (type === 'image/avif') return 'avif'
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

function toBufferAndType(
  image: UploadImageInput,
  contentType?: string
): { buffer: Buffer; type: string } {
  if (image instanceof Uint8Array || Buffer.isBuffer(image)) {
    return {
      buffer: Buffer.isBuffer(image) ? image : Buffer.from(image),
      type: contentType || 'image/jpeg',
    }
  }
  // File / Blob — caller must await arrayBuffer before this path if sync needed
  throw new Error('Use uploadSiteImageAdmin for File/Blob (async)')
}

export async function uploadSiteImageAdmin(
  folder: SiteImageFolder,
  slug: string,
  image: UploadImageInput,
  filename?: string,
  contentType?: string
): Promise<string> {
  let buffer: Buffer
  let type: string

  if (image instanceof Uint8Array || Buffer.isBuffer(image)) {
    ;({ buffer, type } = toBufferAndType(image, contentType))
  } else {
    type = image.type || contentType || 'image/jpeg'
    buffer = Buffer.from(await image.arrayBuffer())
  }

  if (!ALLOWED_IMAGE_TYPES.has(type)) {
    throw new Error('Image must be AVIF, JPEG, PNG, or WebP')
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image must be no larger than 5 MB')
  }

  const safeSlug = slug.replace(/[^a-z0-9-]/g, '')
  if (!safeSlug) throw new Error('A valid slug is required for image upload')

  const extension = extensionFor(type)
  const name =
    filename?.replace(/[^\w.\-]+/g, '_') ||
    `hero-${Date.now()}.${extension}`
  const objectPath = `${folder}/${safeSlug}/${name}`
  const downloadToken = randomUUID()
  const bucket = getAdminStorage().bucket()
  const object = bucket.file(objectPath)

  await object.save(buffer, {
    resumable: false,
    metadata: {
      contentType: type,
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })

  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    bucket.name
  )}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`
}
