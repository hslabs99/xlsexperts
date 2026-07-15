'use client'

import { useEffect, useState } from 'react'
import {
  assessBlogImage,
  formatBytes,
  infoFromFile,
  probeImageUrl,
  type ImageSizeInfo,
  type ImageSizeLevel,
  BLOG_IMAGE_TARGETS,
} from '@/lib/blog-image-advice'

const LEVEL_STYLES: Record<
  ImageSizeLevel,
  { box: string; pill: string; label: string }
> = {
  good: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    pill: 'bg-emerald-600 text-white',
    label: 'Good',
  },
  ok: {
    box: 'border-sky-200 bg-sky-50 text-sky-900',
    pill: 'bg-sky-600 text-white',
    label: 'OK',
  },
  large: {
    box: 'border-amber-200 bg-amber-50 text-amber-950',
    pill: 'bg-amber-500 text-white',
    label: 'Large',
  },
  too_large: {
    box: 'border-red-200 bg-red-50 text-red-900',
    pill: 'bg-red-600 text-white',
    label: 'Too big',
  },
  unknown: {
    box: 'border-border bg-white text-ink-muted',
    pill: 'bg-stone-400 text-white',
    label: '…',
  },
}

type Props = {
  /** Current image URL on the post */
  imageUrl: string
  /** Optional pending file (shown during / after pick, before URL updates) */
  pendingFile?: File | null
  compact?: boolean
}

export function BlogImageSizeAdvice({
  imageUrl,
  pendingFile,
  compact,
}: Props) {
  const [info, setInfo] = useState<ImageSizeInfo>({
    bytes: null,
    width: null,
    height: null,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        if (pendingFile) {
          const next = await infoFromFile(pendingFile)
          if (!cancelled) setInfo(next)
          return
        }
        if (!imageUrl.trim()) {
          if (!cancelled)
            setInfo({ bytes: null, width: null, height: null })
          return
        }
        const next = await probeImageUrl(imageUrl)
        if (!cancelled) setInfo(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [imageUrl, pendingFile])

  if (!imageUrl.trim() && !pendingFile) {
    return (
      <p className="text-xs text-ink-muted">
        Tip: use a photo about 1600px wide, under{' '}
        {formatBytes(BLOG_IMAGE_TARGETS.idealMaxBytes)} (JPEG or WebP). That
        keeps the blog fast on phones.
      </p>
    )
  }

  const advice = assessBlogImage(info)
  const style = LEVEL_STYLES[advice.level]

  return (
    <div className={`rounded-md border p-3 text-sm ${style.box}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.pill}`}
        >
          {loading ? 'Checking' : style.label}
        </span>
        {info.bytes != null ? (
          <span className="font-semibold tabular-nums">
            {formatBytes(info.bytes)}
          </span>
        ) : null}
        {info.width && info.height ? (
          <span className="tabular-nums opacity-80">
            {info.width} × {info.height} px
          </span>
        ) : null}
      </div>
      {!compact ? (
        <>
          <p className="mt-2 font-semibold">{advice.headline}</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            {advice.detail}
          </p>
        </>
      ) : (
        <p className="mt-1 text-xs leading-relaxed">{advice.headline}</p>
      )}
    </div>
  )
}
