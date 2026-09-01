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

const MAX_PDF_BYTES = 12 * 1024 * 1024

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

function sanitizeAttachmentFilename(name: string): string {
  const base = name.replace(/[^\w.\-]+/g, '_').replace(/^\.+/, '')
  return base.slice(0, 180) || 'white-paper.pdf'
}

export async function uploadEmailPdfAttachmentAdmin(
  templateId: string,
  file: Buffer,
  filename: string
): Promise<{
  storagePath: string
  url: string
  filename: string
  contentType: string
}> {
  if (file.byteLength > MAX_PDF_BYTES) {
    throw new Error('PDF must be no larger than 12 MB')
  }
  const header = file.subarray(0, 5).toString('ascii')
  if (!header.startsWith('%PDF')) {
    throw new Error('File must be a PDF')
  }

  const safeId = templateId.replace(/[^a-zA-Z0-9_-]/g, '')
  if (!safeId) throw new Error('A valid template id is required')

  const safeName = sanitizeAttachmentFilename(filename)
  const objectPath = `email/attachments/${safeId}/${Date.now()}-${safeName}`
  const downloadToken = randomUUID()
  const bucket = getAdminStorage().bucket()
  const object = bucket.file(objectPath)

  await object.save(file, {
    resumable: false,
    metadata: {
      contentType: 'application/pdf',
      cacheControl: 'private, max-age=0, no-store',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })

  return {
    storagePath: objectPath,
    url: `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
      bucket.name
    )}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`,
    filename: safeName,
    contentType: 'application/pdf',
  }
}

export async function downloadStorageObject(objectPath: string): Promise<{
  buffer: Buffer
  contentType: string
} | null> {
  const path = objectPath.trim()
  if (!path || path.includes('..')) return null
  const bucket = getAdminStorage().bucket()
  const object = bucket.file(path)
  const [exists] = await object.exists()
  if (!exists) return null
  const [buffer] = await object.download()
  const [metadata] = await object.getMetadata()
  return {
    buffer,
    contentType: String(metadata.contentType || 'application/pdf'),
  }
}
