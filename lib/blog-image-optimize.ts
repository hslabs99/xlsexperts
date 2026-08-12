/**
 * Browser-side blog hero optimization (canvas → WebP/JPEG).
 * Keeps uploads small before they ever hit Storage / visitors.
 */

import { BLOG_IMAGE_TARGETS, formatBytes } from '@/lib/blog-image-advice'

export type OptimizedBlogImage = {
  file: File
  width: number
  height: number
  originalBytes: number
  optimizedBytes: number
  changed: boolean
}

function loadBitmap(source: Blob | ImageBitmapSource): Promise<ImageBitmap> {
  return createImageBitmap(source)
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  type: 'image/webp' | 'image/jpeg',
  quality: number
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), type, quality)
  })
  if (!blob) {
    throw new Error(`Could not encode image as ${type}`)
  }
  return blob
}

/**
 * Downscale to ~1600px wide and compress to WebP (fallback JPEG)
 * aiming for under BLOG_IMAGE_TARGETS.idealMaxBytes.
 */
export async function optimizeBlogImageFile(
  file: File,
  options?: { maxBytes?: number; maxWidth?: number }
): Promise<OptimizedBlogImage> {
  const maxBytes = options?.maxBytes ?? BLOG_IMAGE_TARGETS.idealMaxBytes
  const maxWidth = options?.maxWidth ?? 1600
  const originalBytes = file.size

  // Already small enough — keep as-is when under target and not huge pixels
  const bitmap = await loadBitmap(file)
  const needsResize = bitmap.width > maxWidth
  const needsCompress = originalBytes > maxBytes

  if (!needsResize && !needsCompress) {
    const result: OptimizedBlogImage = {
      file,
      width: bitmap.width,
      height: bitmap.height,
      originalBytes,
      optimizedBytes: originalBytes,
      changed: false,
    }
    bitmap.close()
    return result
  }

  const scale = needsResize ? maxWidth / bitmap.width : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not prepare the blog image for optimization')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'blog-hero'
  let bestBlob: Blob | null = null
  let bestType: 'image/webp' | 'image/jpeg' = 'image/webp'
  let bestExt = 'webp'

  for (const quality of [0.82, 0.74, 0.66, 0.58, 0.5]) {
    try {
      const blob = await encodeCanvas(canvas, 'image/webp', quality)
      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob
        bestType = 'image/webp'
        bestExt = 'webp'
      }
      if (blob.size <= maxBytes) break
    } catch {
      // WebP may be unsupported in older browsers
    }
  }

  if (!bestBlob || bestBlob.size > maxBytes) {
    for (const quality of [0.82, 0.74, 0.66, 0.58, 0.5]) {
      const blob = await encodeCanvas(canvas, 'image/jpeg', quality)
      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob
        bestType = 'image/jpeg'
        bestExt = 'jpg'
      }
      if (blob.size <= maxBytes) break
    }
  }

  if (!bestBlob) {
    throw new Error('Could not optimize the blog image')
  }

  const optimized = new File([bestBlob], `${baseName}.${bestExt}`, {
    type: bestType,
  })

  return {
    file: optimized,
    width,
    height,
    originalBytes,
    optimizedBytes: optimized.size,
    changed: true,
  }
}

export function describeOptimization(result: OptimizedBlogImage): string {
  if (!result.changed) {
    return `Image already web-ready (${formatBytes(result.optimizedBytes)}, ${result.width}×${result.height}).`
  }
  return `Optimized ${formatBytes(result.originalBytes)} → ${formatBytes(result.optimizedBytes)} (${result.width}×${result.height}).`
}

export async function fileFromImageUrl(url: string): Promise<File> {
  const resolved =
    url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')
      ? url
      : new URL(url, window.location.origin).toString()
  const res = await fetch(resolved, { mode: 'cors' })
  if (!res.ok) {
    throw new Error('Could not download the current image to optimize it')
  }
  const blob = await res.blob()
  const type = blob.type || 'image/jpeg'
  const ext = type.includes('webp')
    ? 'webp'
    : type.includes('png')
      ? 'png'
      : 'jpg'
  return new File([blob], `blog-hero.${ext}`, { type })
}
