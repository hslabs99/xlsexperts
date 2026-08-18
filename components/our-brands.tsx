'use client'

import { Fragment } from 'react'
import { useMarketCopy } from '@/components/market-provider'

const BRANDS = [
  {
    href: 'https://www.excelexperts.co.nz',
    labelKey: 'brandNzLabel' as const,
  },
  {
    href: 'https://www.excelexperts.com',
    labelKey: 'brandIntlLabel' as const,
  },
  {
    href: 'https://www.excelexperts.co.uk',
    labelKey: 'brandUkLabel' as const,
  },
]

export function OurBrands({ compact = false }: { compact?: boolean }) {
  const copy = useMarketCopy()
  const labels = BRANDS.map((brand) => ({
    href: brand.href,
    label: copy.about[brand.labelKey],
  }))

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">
          Our brands
        </h3>
        <div className="flex flex-col gap-1.5">
          {labels.map((brand) => (
            <a
              key={brand.href}
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-700 underline-offset-2 hover:underline"
            >
              {brand.label}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-14 border-t border-gray-100 pt-8 text-center">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
        Our brands
      </span>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-6">
        {labels.map((brand, index) => (
          <Fragment key={brand.href}>
            {index > 0 ? <span className="text-gray-300">|</span> : null}
            <a
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-700 underline-offset-2 hover:underline"
            >
              {brand.label}
            </a>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
