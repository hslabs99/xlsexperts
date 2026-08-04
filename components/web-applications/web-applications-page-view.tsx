import { Contact } from '@/components/contact'
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
  NZCoverageSection,
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
}: {
  h1?: string
  heroIntro?: string
}) {
  return (
    <main className="pt-16">
      <WebApplicationsHero h1={h1} heroIntro={heroIntro} />
      <CapabilityStrip />
      <PageSectionNav />
      <AccessibleSoftwareSection />
      <WhatIsWebApplication />
      <WebApplicationBenefits />
      <ApplicationOpportunityGrid />
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
      <NZCoverageSection />
      <WebApplicationFAQ />
      <RelatedLinksSection />
      <WebApplicationCTA />
      <Contact />
    </main>
  )
}
