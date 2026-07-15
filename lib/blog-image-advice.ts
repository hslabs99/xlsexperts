/**
 * Simple image size guidance for marketing / non-technical blog editors.
 */

export type ImageSizeLevel = 'good' | 'ok' | 'large' | 'too_large' | 'unknown'

export type ImageSizeInfo = {
  bytes: number | null
  width: number | null
  height: number | null
}

/** Targets for fast mobile blog pages */
export const BLOG_IMAGE_TARGETS = {
  /** Ideal max file weight */
  idealMaxBytes: 400 * 1024,
  /** Still acceptable */
  okMaxBytes: 800 * 1024,
  /** Above this — replace */
  tooLargeBytes: 1.5 * 1024 * 1024,
  /** Ideal width for hero / OG */
  idealMinWidth: 1200,
  idealMaxWidth: 2000,
  tooSmallWidth: 800,
  tooWideWidth: 3600,
} as const

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function assessBlogImage(info: ImageSizeInfo): {
  level: ImageSizeLevel
  headline: string
  detail: string
} {
  const { bytes, width, height } = info
  const t = BLOG_IMAGE_TARGETS

  if (bytes == null && width == null) {
    return {
      level: 'unknown',
      headline: 'Checking image…',
      detail: 'We will show whether this photo is a good size for the site.',
    }
  }

  const sizeLabel = bytes != null ? formatBytes(bytes) : 'unknown size'
  const dimLabel =
    width && height ? `${width} × ${height} px` : 'dimensions unknown'

  if (bytes != null && bytes > t.tooLargeBytes) {
    return {
      level: 'too_large',
      headline: 'Too large for the website',
      detail: `This file is ${sizeLabel} (${dimLabel}). That will slow the blog on phones. Replace it with a compressed JPEG or WebP under about ${formatBytes(t.idealMaxBytes)} (roughly 1600px wide).`,
    }
  }

  if (bytes != null && bytes > t.okMaxBytes) {
    return {
      level: 'large',
      headline: 'Larger than we recommend',
      detail: `This file is ${sizeLabel} (${dimLabel}). It will work, but visitors on mobile may wait longer. Prefer under ${formatBytes(t.idealMaxBytes)} if you can recompress it.`,
    }
  }

  if (width != null && width < t.tooSmallWidth) {
    return {
      level: 'large',
      headline: 'Image may look soft / blurry',
      detail: `Width is only ${width}px (${sizeLabel}). Blog heroes look best around 1200–1600px wide. Use a larger photo if you have one.`,
    }
  }

  if (width != null && width > t.tooWideWidth) {
    return {
      level: 'large',
      headline: 'Dimensions are bigger than needed',
      detail: `Width is ${width}px (${sizeLabel}). The site only needs about 1600px wide — resize smaller to keep pages fast.`,
    }
  }

  if (bytes != null && bytes > t.idealMaxBytes) {
    return {
      level: 'ok',
      headline: 'Acceptable size',
      detail: `${sizeLabel}, ${dimLabel}. Fine for most posts. Ideal target is under ${formatBytes(t.idealMaxBytes)}.`,
    }
  }

  if (bytes == null && width != null) {
    return {
      level: 'ok',
      headline: 'Looks usable',
      detail: `${dimLabel}. We could not read the file weight — if the photo was exported from a phone/camera raw, still try to keep under ${formatBytes(t.idealMaxBytes)}.`,
    }
  }

  return {
    level: 'good',
    headline: 'Good size for the website',
    detail: `${sizeLabel}, ${dimLabel}. This should load quickly on phones and look sharp on the blog.`,
  }
}

export async function probeImageUrl(
  url: string
): Promise<ImageSizeInfo> {
  const result: ImageSizeInfo = { bytes: null, width: null, height: null }
  if (!url.trim()) return result

  const resolved =
    url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')
      ? url
      : typeof window !== 'undefined'
        ? new URL(url, window.location.origin).toString()
        : url

  try {
    const res = await fetch(resolved, { method: 'HEAD', mode: 'cors' })
    const len = res.headers.get('content-length')
    if (len) result.bytes = Number(len)
  } catch {
    // CORS / HEAD often blocked for Storage — try GET range below
  }

  if (result.bytes == null) {
    try {
      const res = await fetch(resolved, {
        method: 'GET',
        mode: 'cors',
        headers: { Range: 'bytes=0-0' },
      })
      const range = res.headers.get('content-range')
      const match = range?.match(/\/(\d+)\s*$/)
      if (match) result.bytes = Number(match[1])
      else {
        const len = res.headers.get('content-length')
        if (len && res.status === 200) result.bytes = Number(len)
      }
    } catch {
      // ignore
    }
  }

  // Full GET as last resort for same-origin / images that allow CORS
  if (result.bytes == null) {
    try {
      const res = await fetch(resolved, { mode: 'cors' })
      if (res.ok) {
        const buf = await res.arrayBuffer()
        result.bytes = buf.byteLength
      }
    } catch {
      // ignore
    }
  }

  await new Promise<void>((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      result.width = img.naturalWidth
      result.height = img.naturalHeight
      resolve()
    }
    img.onerror = () => resolve()
    img.src = resolved
  })

  return result
}

export function infoFromFile(file: File): Promise<ImageSizeInfo> {
  return new Promise((resolve) => {
    const info: ImageSizeInfo = {
      bytes: file.size,
      width: null,
      height: null,
    }
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      info.width = img.naturalWidth
      info.height = img.naturalHeight
      URL.revokeObjectURL(url)
      resolve(info)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(info)
    }
    img.src = url
  })
}
