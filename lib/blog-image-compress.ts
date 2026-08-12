import 'server-only'
import { BLOG_IMAGE_TARGETS } from '@/lib/blog-image-advice'

export type CompressedBlogImage = {
  bytes: Buffer
  contentType: 'image/webp' | 'image/jpeg'
  filename: string
  width: number | null
  height: number | null
  originalBytes: number
}

/**
 * Resize + compress a blog hero for fast mobile pages.
 * Target: ≤ ~1600px wide and under BLOG_IMAGE_TARGETS.idealMaxBytes.
 */
export async function compressBlogImageBuffer(
  raw: Buffer,
  options?: { maxBytes?: number; maxWidth?: number; baseName?: string }
): Promise<CompressedBlogImage> {
  const maxBytes = options?.maxBytes ?? BLOG_IMAGE_TARGETS.idealMaxBytes
  const maxWidth = options?.maxWidth ?? 1600
  const baseName = (options?.baseName || 'hero').replace(/[^\w.-]+/g, '_')
  const originalBytes = raw.byteLength

  const sharpMod = await import('sharp')
  const sharp = sharpMod.default

  let quality = 78
  let best: CompressedBlogImage | null = null

  while (quality >= 48) {
    const pipeline = sharp(raw)
      .rotate()
      .resize({
        width: maxWidth,
        height: Math.round((maxWidth * 2) / 3),
        fit: 'inside',
        withoutEnlargement: true,
      })

    const { data, info } = await pipeline
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true })

    best = {
      bytes: data,
      contentType: 'image/webp',
      filename: `${baseName}.webp`,
      width: info.width ?? null,
      height: info.height ?? null,
      originalBytes,
    }

    if (data.byteLength <= maxBytes) {
      return best
    }
    quality -= 8
  }

  // Last resort: JPEG often smaller for photo-like heroes
  const jpeg = await sharp(raw)
    .rotate()
    .resize({
      width: maxWidth,
      height: Math.round((maxWidth * 2) / 3),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer({ resolveWithObject: true })

  const jpegResult: CompressedBlogImage = {
    bytes: jpeg.data,
    contentType: 'image/jpeg',
    filename: `${baseName}.jpg`,
    width: jpeg.info.width ?? null,
    height: jpeg.info.height ?? null,
    originalBytes,
  }

  if (
    !best ||
    jpegResult.bytes.byteLength < best.bytes.byteLength
  ) {
    return jpegResult
  }
  return best
}
