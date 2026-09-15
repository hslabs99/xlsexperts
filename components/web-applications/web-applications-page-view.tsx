import { PageContact } from '@/components/page-contact'
import { type MarketId } from '@/lib/market'
import { WebApplicationsHero, CapabilityStrip } from './web-applications-hero'
import { PageSectionNav } from './page-section-nav'
import {
  AccessibleSoftwareSection,
  ApplicationOpportunityGrid,
  ApplicationTypeCards,
  WhatIsWebApplication,
  WebApplicationBenefits,
} from './foundations'
import { HybridExcelWebSection, SpreadsheetToWebSection } from './excel-path'
import { ApplicationCaseStudies } from './application-case-studies'
import {
  AIApplicationsSection,
  IntegrationSection,
  SecurityGovernanceSection,
  TechnologyStack,
  WhyXLSExperts,
} from './why-and-tech'
import {
  CostFactorsSection,
  DevelopmentProcess,
  CoverageSection,
  StartSmallSection,
} from './delivery'
import {
  RelatedLinksSection,
  WebApplicationCTA,
  WebApplicationFAQ,
} from './faq-and-cta'

export function WebApplicationsPageView({
  h1,
  heroIntro,
  faqs,
  market,
}: {
  h1?: string
  heroIntro?: string
  faqs?: { question: string; answer: string }[]
  market: MarketId
}) {
  return (
    <main className="pt-16">
      <WebApplicationsHero h1={h1} heroIntro={heroIntro} market={market} />
      <CapabilityStrip market={market} />
      <PageSectionNav />
      <AccessibleSoftwareSection />
      <WhatIsWebApplication />
      <WebApplicationBenefits />
      <ApplicationOpportunityGrid market={market} />
      <ApplicationTypeCards />
      <SpreadsheetToWebSection />
      <HybridExcelWebSection />
      <ApplicationCaseStudies />
      <WhyXLSExperts />
      <TechnologyStack />
      <AIApplicationsSection />
      <SecurityGovernanceSection />
      <IntegrationSection />
      <DevelopmentProcess />
      <StartSmallSection />
      <CostFactorsSection />
      <CoverageSection market={market} />
      <WebApplicationFAQ faqs={faqs} />
      <RelatedLinksSection />
      <WebApplicationCTA />
      <PageContact topicHref="/web-applications" />
    </main>
  )
}
