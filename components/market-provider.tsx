'use client'

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import type { MarketId } from '@/lib/market'
import {
  DEFAULT_INTL_MARKET_COPY,
  DEFAULT_NZ_MARKET_COPY,
  DEFAULT_UK_MARKET_COPY,
  type BrandLabels,
  type MarketCopy,
} from '@/lib/market-copy'

type MarketContextValue = {
  market: MarketId
  copy: MarketCopy
  localDev: boolean
  brandLabels: BrandLabels
}

const DEFAULT_BRAND_LABELS: BrandLabels = {
  nz: DEFAULT_NZ_MARKET_COPY.about.brandLabel,
  intl: DEFAULT_INTL_MARKET_COPY.about.brandLabel,
  uk: DEFAULT_UK_MARKET_COPY.about.brandLabel,
}

const MarketContext = createContext<MarketContextValue>({
  market: 'nz',
  copy: DEFAULT_NZ_MARKET_COPY,
  localDev: false,
  brandLabels: DEFAULT_BRAND_LABELS,
})

export function MarketProvider({
  market,
  copy,
  localDev = false,
  brandLabels = DEFAULT_BRAND_LABELS,
  children,
}: {
  market: MarketId
  copy: MarketCopy
  localDev?: boolean
  brandLabels?: BrandLabels
  children: ReactNode
}) {
  return (
    <MarketContext.Provider value={{ market, copy, localDev, brandLabels }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket(): MarketContextValue {
  return useContext(MarketContext)
}

export function useMarketCopy(): MarketCopy {
  return useContext(MarketContext).copy
}

export function useBrandLabels(): BrandLabels {
  return useContext(MarketContext).brandLabels
}
