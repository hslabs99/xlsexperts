/** True when a blog post has a usable hero URL (not empty / whitespace). */
export function hasBlogImageSrc(src: string | null | undefined): boolean {
  return typeof src === 'string' && src.trim().length > 0
}
