import { Contact } from '@/components/contact'
import { powerAppsNavItems } from '@/lib/power-apps-page'
import { PageSectionNav } from '@/components/web-applications/page-section-nav'
import { PowerAppsCapabilityStrip, PowerAppsHero } from './power-apps-hero'
import {
  ApproachSection,
  AudienceSection,
  BroaderCapabilitySection,
  CoverageSection,
  DataverseSection,
  DynamicsSection,
  PositioningSection,
  PowerAppsCta,
  PowerAppsFaqSection,
  PowerAppsRelatedLinks,
  ProcessFirstSection,
  UseCasesSection,
  WhatIsPowerAppsSection,
} from './power-apps-sections'

export function PowerAppsPageView({
  h1,
  heroIntro,
}: {
  h1?: string
  heroIntro?: string
}) {
  return (
    <main className="pt-16">
      <PowerAppsHero h1={h1} heroIntro={heroIntro} />
      <PowerAppsCapabilityStrip />
      <PageSectionNav items={powerAppsNavItems} selectId="power-apps-section-nav" />
      <PositioningSection />
      <WhatIsPowerAppsSection />
      <DataverseSection />
      <DynamicsSection />
      <ProcessFirstSection />
      <BroaderCapabilitySection />
      <UseCasesSection />
      <AudienceSection />
      <ApproachSection />
      <CoverageSection />
      <PowerAppsFaqSection />
      <PowerAppsRelatedLinks />
      <PowerAppsCta />
      <Contact />
    </main>
  )
}
