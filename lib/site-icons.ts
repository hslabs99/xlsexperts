import type { Metadata } from 'next'

/**
 * One XLS Experts mark for every surface: tabs, iOS, and Google Search.
 * PNG/ICO are required because crawlers still request /favicon.ico and
 * /favicon-32x32.png, and often prefer apple-touch-icon over SVG.
 */
export const SITE_ICONS: NonNullable<Metadata['icons']> = {
  icon: [
    { url: '/favicon.ico', sizes: '48x48' },
    { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
    { url: '/icon.svg', type: 'image/svg+xml' },
  ],
  apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  shortcut: ['/favicon.ico'],
}
