import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { getFirebaseStorage } from '@/lib/firebase'

export function formatStorageError(err: unknown): string {
  if (!err || typeof err !== 'object') return String(err)
  const e = err as {
    code?: string
    message?: string
    serverResponse?: string
    customData?: { serverResponse?: string }
  }
  const server =
    e.customData?.serverResponse || e.serverResponse || ''
  return [e.code, e.message, server].filter(Boolean).join(' | ')
}

/**
 * Upload hero image bytes to Firebase Storage.
 * Prefer Uint8Array / ArrayBuffer in Node (Blob can fail with storage/unknown).
 */
function toUploadBody(
  file: File | Blob | Uint8Array | ArrayBuffer,
  contentType?: string
): { body: Blob | Uint8Array; type: string } {
  let type = contentType || 'image/jpeg'
  if (file instanceof Uint8Array) return { body: file, type }
  if (file instanceof ArrayBuffer) return { body: new Uint8Array(file), type }
  if (file instanceof Blob) {
    type = file.type || type
    return { body: file, type }
  }
  return { body: file as Uint8Array, type }
}

export async function prepareCaseStudyImageUpload(file: File): Promise<File> {
  const width = 900
  const height = 300
  const bitmap = await createImageBitmap(file)
  const targetRatio = width / height
  const sourceRatio = bitmap.width / bitmap.height

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = bitmap.width
  let sourceHeight = bitmap.height

  if (sourceRatio > targetRatio) {
    sourceWidth = bitmap.height * targetRatio
    sourceX = (bitmap.width - sourceWidth) / 2
  } else {
    sourceHeight = bitmap.width / targetRatio
    sourceY = (bitmap.height - sourceHeight) / 2
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Could not prepare the case study image')
  }

  context.drawImage(
    bitmap,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  )
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result
          ? resolve(result)
          : reject(new Error('Could not encode the case study image')),
      'image/webp',
      0.85
    )
  })
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'hero'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}

export async function uploadCaseStudyImage(
  slug: string,
  file: File | Blob | Uint8Array | ArrayBuffer,
  filename?: string,
  contentType?: string
): Promise<string> {
  const safeSlug = slug.trim() || 'untitled'
  const name =
    filename ||
    (file instanceof File && file.name
      ? file.name.replace(/[^\w.\-]+/g, '_')
      : `hero-${Date.now()}.jpg`)
  const { body, type } = toUploadBody(file, contentType)

  const storageRef = ref(
    getFirebaseStorage(),
    `case-studies/${safeSlug}/${name}`
  )
  await uploadBytes(storageRef, body, { contentType: type })
  return getDownloadURL(storageRef)
}

/** Compact thumbs for discovery emails — path: email/case-studies/{slug}.jpg */
export async function uploadEmailCaseStudyThumb(
  slug: string,
  file: File | Blob | Uint8Array | ArrayBuffer,
  contentType?: string
): Promise<string> {
  const safeSlug = slug.trim() || 'untitled'
  const { body, type } = toUploadBody(file, contentType || 'image/jpeg')
  const storageRef = ref(
    getFirebaseStorage(),
    `email/case-studies/${safeSlug}.jpg`
  )
  await uploadBytes(storageRef, body, { contentType: type })
  return getDownloadURL(storageRef)
}

export async function importCaseStudySiteImageToStorage(
  slug: string,
  imagePath: string
): Promise<string | null> {
  if (!imagePath.startsWith('/')) return null
  try {
    const res = await fetch(imagePath)
    if (!res.ok) return null
    const blob = await res.blob()
    const ext =
      imagePath.split('.').pop()?.split('?')[0]?.replace(/[^\w]+/g, '') || 'png'
    const bytes = new Uint8Array(await blob.arrayBuffer())
    return uploadCaseStudyImage(
      slug,
      bytes,
      `hero.${ext === 'jpg' ? 'jpg' : ext}`,
      blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg')
    )
  } catch {
    return null
  }
}

export async function deleteCaseStudyStoragePath(path: string): Promise<void> {
  await deleteObject(ref(getFirebaseStorage(), path))
}
