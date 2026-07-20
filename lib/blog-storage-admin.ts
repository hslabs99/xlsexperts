import { uploadSiteImageAdmin } from '@/lib/storage-admin'

export async function uploadBlogImageAdmin(
  slug: string,
  image: File | Blob | Uint8Array | Buffer,
  filename?: string,
  contentType?: string
): Promise<string> {
  return uploadSiteImageAdmin('blog', slug, image, filename, contentType)
}
