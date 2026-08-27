import { uploadSiteImageAdmin } from '@/lib/storage-admin'
import { storageSlugForHost } from '@/lib/client-logos'

export async function uploadClientLogoAdmin(
  host: string,
  image: File | Blob | Uint8Array | Buffer,
  filename?: string,
  contentType?: string
): Promise<string> {
  return uploadSiteImageAdmin(
    'client-logos',
    storageSlugForHost(host),
    image,
    filename,
    contentType
  )
}
