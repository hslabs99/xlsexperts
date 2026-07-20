import { uploadSiteImageAdmin } from '@/lib/storage-admin'

export async function uploadCaseStudyImageAdmin(
  slug: string,
  image: File | Blob | Uint8Array | Buffer,
  filename?: string,
  contentType?: string
): Promise<string> {
  return uploadSiteImageAdmin(
    'case-studies',
    slug,
    image,
    filename,
    contentType
  )
}
