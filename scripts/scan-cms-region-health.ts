import { buildCmsRegionHealthReport } from '@/lib/cms-region-health'
import { PUBLISHED_PAGE_SEO } from '@/data/page-seo.generated'
import { PUBLISHED_MARKET_COPY } from '@/data/market-copy.generated'
import { PUBLISHED_HOME_SERVICES } from '@/data/home-services.generated'
import { PUBLISHED_HERO_TOP_BULLETS } from '@/data/hero-top-bullets.generated'

const report = buildCmsRegionHealthReport({
  pageSeo: PUBLISHED_PAGE_SEO.markets,
  marketCopy: PUBLISHED_MARKET_COPY.markets,
  homeServices: PUBLISHED_HOME_SERVICES.content,
  topBullets: PUBLISHED_HERO_TOP_BULLETS.content,
})

console.log(`Published-file findings: ${report.findingCount}`)
for (const finding of report.findings) {
  console.log(`- [${finding.sourceLabel}] ${finding.title}`)
  console.log(`  ${finding.detail}`)
}
