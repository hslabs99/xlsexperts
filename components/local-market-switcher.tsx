'use client'

import { usePathname } from 'next/navigation'
import { LOCAL_MARKET_SWITCHES, stripLocalMarketPrefix } from '@/lib/market'
import { useMarket } from '@/components/market-provider'

/**
 * Localhost-only bar so you can preview NZ / USA / UK without changing hosts.
 * Stay on /nz, /usa, or /uk so each region is a distinct URL (not a shared `/`).
 * Hidden in production.
 */
export function LocalMarketSwitcher() {
  const { market, localDev } = useMarket()
  const pathname = usePathname()

  if (!localDev) return null
  if (pathname?.startsWith('/admin')) return null

  function switchTo(segment: 'nz' | 'usa' | 'uk') {
    const stripped = stripLocalMarketPrefix(pathname || '/')
    const rest = stripped?.pathname ?? pathname ?? '/'
    const path = rest && rest !== '/' ? rest : ''
    const search = window.location.search
    const hash = window.location.hash
    window.location.assign(`/${segment}${path}${search}${hash}`)
  }

  return (
    <div
      className="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 text-amber-950"
      role="region"
      aria-label="Local region preview"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
        <p className="text-xs font-medium">
          Local preview:{' '}
          <span className="font-semibold">
            {market === 'uk'
              ? 'United Kingdom'
              : market === 'intl'
                ? 'USA / International'
                : 'New Zealand'}
          </span>
          <span className="ml-1.5 font-normal text-amber-800/80">
            (default is NZ — switch to USA or UK to test those sites)
          </span>
        </p>
        <div className="flex items-center gap-1">
          {LOCAL_MARKET_SWITCHES.map((item) => {
            const active = item.market === market
            return (
              <button
                key={item.segment}
                type="button"
                title={`Preview ${item.hint} via /${item.segment}`}
                onClick={() => switchTo(item.segment)}
                className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition ${
                  active
                    ? 'bg-amber-900 text-amber-50'
                    : 'bg-white text-amber-900 hover:bg-amber-100'
                }`}
                aria-current={active ? 'true' : undefined}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
