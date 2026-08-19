import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SiteTags } from '@/components/site-tags'
import { FloatingConsultationCta } from '@/components/floating-consultation-cta'
import { FunnelTracker } from '@/components/funnel-tracker'
import { MarketProvider } from '@/components/market-provider'
import { LocalMarketSwitcher } from '@/components/local-market-switcher'
import {
  brandLabelsFromBundle,
  keywordsToArray,
  pickMarketCopy,
} from '@/lib/market-copy'
import {
  getIsLocalDev,
  getLiveMarketCopyBundle,
  getMarket,
  getMarketCopy,
} from '@/lib/market-server'
import { SITE_ICONS } from '@/lib/site-icons'
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

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getMarketCopy()
  const { site } = copy
  return {
    metadataBase: new URL(site.origin),
    title: {
      default: site.defaultTitle,
      template: '%s | XLS Experts',
    },
    description: site.defaultDescription,
    keywords: keywordsToArray(site.keywords),
    authors: [{ name: 'XLS Experts', url: site.origin }],
    creator: 'XLS Experts',
    publisher: 'XLS Experts',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    icons: SITE_ICONS,
    openGraph: {
      type: 'website',
      locale: site.ogLocale,
      url: site.origin,
      siteName: 'XLS Experts',
      title: site.ogTitle,
      description: site.ogDescription,
      images: [
        {
          url: '/images/og-default.png',
          width: 1200,
          height: 630,
          alt: site.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.twitterTitle,
      description: site.twitterDescription,
      images: ['/images/og-default.png'],
    },
    alternates: {
      canonical: site.origin,
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: '#1a6b3c',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const market = await getMarket()
  const copyBundle = await getLiveMarketCopyBundle()
  const copy = pickMarketCopy(copyBundle, market)
  const localDev = await getIsLocalDev()

  return (
    <html lang={copy.site.htmlLang} className="bg-background">
      <body className="font-sans antialiased">
        <MarketProvider
          key={market}
          market={market}
          copy={copy}
          brandLabels={brandLabelsFromBundle(copyBundle)}
          localDev={localDev}
        >
          <LocalMarketSwitcher />
          <SiteTags />
          <FunnelTracker />
          {children}
          <FloatingConsultationCta />
        </MarketProvider>
      </body>
    </html>
  )
}
