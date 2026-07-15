import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SiteTags } from '@/components/site-tags'
import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

const _plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.xlsexperts.co.nz'),
  title: {
    default: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    template: '%s | XLS Experts',
  },
  description:
    'XLS Experts are New Zealand\'s leading Excel and spreadsheet consultants. We build models, automate data, and create dashboards that transform how your business works.',
  keywords: [
    'Excel consultant New Zealand',
    'Excel VBA developer NZ',
    'spreadsheet automation New Zealand',
    'Excel dashboard NZ',
    'Excel financial modelling NZ',
    'Power Query NZ',
    'business process automation New Zealand',
    'Excel expert Auckland',
  ],
  authors: [{ name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz' }],
  creator: 'XLS Experts',
  publisher: 'XLS Experts',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/icon.svg'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.xlsexperts.co.nz',
    siteName: 'XLS Experts',
    title: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    description:
      'New Zealand\'s leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling, and workflow automation.',
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'XLS Experts — Excel & Spreadsheet Consulting NZ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    description:
      'New Zealand\'s leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling.',
    images: ['/images/og-default.png'],
  },
  alternates: {
    canonical: 'https://www.xlsexperts.co.nz',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: '#1a6b3c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-NZ" className="bg-background">
      <body className="font-sans antialiased">
        <SiteTags />
        {children}
      </body>
    </html>
  )
}
