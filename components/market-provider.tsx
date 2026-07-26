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
}

const MarketContext = createContext<MarketContextValue>({
  market: 'nz',
  copy: DEFAULT_NZ_MARKET_COPY,
})

export function MarketProvider({
  market,
  copy,
  children,
}: {
  market: MarketId
  copy: MarketCopy
  children: ReactNode
}) {
  return (
    <MarketContext.Provider value={{ market, copy }}>
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
