'use client'

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import type { MarketId } from '@/lib/market'
import {
  DEFAULT_NZ_MARKET_COPY,
  type MarketCopy,
} from '@/lib/market-copy'

type MarketContextValue = {
  market: MarketId
  copy: MarketCopy
  localDev: boolean
}

const MarketContext = createContext<MarketContextValue>({
  market: 'nz',
  copy: DEFAULT_NZ_MARKET_COPY,
  localDev: false,
})

export function MarketProvider({
  market,
  copy,
  localDev = false,
  children,
}: {
  market: MarketId
  copy: MarketCopy
  localDev?: boolean
  children: ReactNode
}) {
  return (
    <MarketContext.Provider value={{ market, copy, localDev }}>
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
