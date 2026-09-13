import { MARKET_IDS } from '@/lib/market'
import { getMarketCopy } from '@/lib/market-server'
import { absoluteOnOrigin, buildAlternates } from '@/lib/regions'

/**
 * Next.js Metadata API rewrites homepage URLs to origin with no trailing slash
 * (`pathname === '/'` → `url.origin`). Google matches hreflang exactly, so the
 * homepage cluster is emitted here with the slash intact.
 */
export async function HomepageSeoLinks() {
  const { site } = await getMarketCopy()
  const canonical = absoluteOnOrigin(site.origin, '/')
  const languages = buildAlternates('/', MARKET_IDS) ?? {}
  return (
    <>
      <link rel="canonical" href={canonical} />
      {Object.entries(languages).map(([lang, href]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}
    </>
  )
}
