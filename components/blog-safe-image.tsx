'use client'

import { useState } from 'react'
import Image from 'next/image'
import { hasBlogImageSrc } from '@/lib/blog-image-src'

type Props = {
  src: string | null | undefined
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  loading?: 'eager' | 'lazy'
}

/** Public blog hero: missing or failed images render as a blank square. */
export function BlogSafeImage({
  src,
  alt,
  className,
  sizes,
  priority,
  loading,
}: Props) {
  const [failed, setFailed] = useState(false)
  const url = src?.trim() ?? ''

  if (!hasBlogImageSrc(url) || failed) {
    return (
      <div
        className="absolute inset-0 bg-gray-100"
        aria-hidden="true"
      />
    )
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      loading={loading}
      unoptimized={url.startsWith('http')}
      onError={() => setFailed(true)}
    />
  )
}
