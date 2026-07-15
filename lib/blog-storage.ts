import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { getFirebaseStorage } from '@/lib/firebase'

/**
 * Upload a blog hero (or inline) image to Firebase Storage.
 * Returns a public download URL for use in BlogPost.image / next/image.
 */
export async function uploadBlogImage(
  slug: string,
  file: File | Blob,
  filename?: string
): Promise<string> {
  const safeSlug = slug.trim() || 'untitled'
  const name =
    filename ||
    (file instanceof File && file.name
      ? file.name.replace(/[^\w.\-]+/g, '_')
      : `hero-${Date.now()}.jpg`)
  const storageRef = ref(getFirebaseStorage(), `blog/${safeSlug}/${name}`)
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  })
  return getDownloadURL(storageRef)
}

/**
 * Fetch an existing site image (e.g. `/images/blog-foo.png`) and upload it
 * into Firebase Storage for the given slug. Returns the new download URL,
 * or null if the local image could not be fetched.
 */
export async function importSiteImageToStorage(
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
    return uploadBlogImage(slug, blob, `hero.${ext}`)
  } catch {
    return null
  }
}

export async function deleteBlogStoragePath(path: string): Promise<void> {
  await deleteObject(ref(getFirebaseStorage(), path))
}
