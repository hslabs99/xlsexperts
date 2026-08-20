import 'server-only'
import { BLOG_IMAGE_TARGETS } from '@/lib/blog-image-advice'

export type CompressedBlogImage = {
  bytes: Buffer
  contentType: 'image/webp' | 'image/jpeg' | 'image/png'
  filename: string
  width: number | null
  height: number | null
  originalBytes: number
}

function passthroughOriginal(
  raw: Buffer,
  baseName: string,
  originalBytes: number
): CompressedBlogImage {
  const isPng = raw[0] === 0x89 && raw[1] === 0x50
  const isJpeg = raw[0] === 0xff && raw[1] === 0xd8
  const isWebp =
    raw.length >= 12 &&
    raw[0] === 0x52 &&
    raw[1] === 0x49 &&
    raw[8] === 0x57 &&
    raw[9] === 0x45
  const contentType: CompressedBlogImage['contentType'] = isPng
    ? 'image/png'
    : isWebp
      ? 'image/webp'
      : 'image/jpeg'
  const ext = isPng ? 'png' : isWebp ? 'webp' : isJpeg ? 'jpg' : 'jpg'
  return {
    bytes: raw,
    contentType,
    filename: `${baseName}.${ext}`,
    width: null,
    height: null,
    originalBytes,
  }
}

/**
 * Resize + compress a blog hero for fast mobile pages.
 * Target: ≤ ~1600px wide and under BLOG_IMAGE_TARGETS.idealMaxBytes.
 * If sharp cannot load (common on linux deploys missing libvips), return the
 * original bytes so image generation still succeeds.
 */
export async function compressBlogImageBuffer(
  raw: Buffer,
  options?: { maxBytes?: number; maxWidth?: number; baseName?: string }
): Promise<CompressedBlogImage> {
  const maxBytes = options?.maxBytes ?? BLOG_IMAGE_TARGETS.idealMaxBytes
  const maxWidth = options?.maxWidth ?? 1600
  const baseName = (options?.baseName || 'hero').replace(/[^\w.-]+/g, '_')
  const originalBytes = raw.byteLength

  try {
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
  } catch (err) {
    console.warn(
      '[blog-image-compress] sharp unavailable, using original image bytes',
      err instanceof Error ? err.message : err
    )
    return passthroughOriginal(raw, baseName, originalBytes)
  }
}
