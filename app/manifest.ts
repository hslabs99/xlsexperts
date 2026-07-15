import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XLS Experts — Excel & Spreadsheet Consulting NZ',
    short_name: 'XLS Experts',
    description:
      "New Zealand's leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling.",
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#1a6b3c',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
