import {
  SolutionHero,
} from '@/components/solutions/solution-hero'
import { SolutionIntro } from '@/components/solutions/solution-intro'
import { ProblemSigns } from '@/components/solutions/problem-signs'
import { SolutionCapabilities } from '@/components/solutions/solution-capabilities'
import { UseCaseGrid } from '@/components/solutions/use-case-grid'
import { TechnologyStrip } from '@/components/solutions/technology-strip'
import { ProcessSteps } from '@/components/solutions/process-steps'
import { SolutionDeepContent } from '@/components/solutions/solution-deep-content'
import { RelatedCaseStudies } from '@/components/solutions/related-case-studies'
import { RelatedSolutions } from '@/components/solutions/related-solutions'
import { SolutionFAQ, solutionFaqJsonLd } from '@/components/solutions/solution-faq'
import { SolutionCTA } from '@/components/solutions/solution-cta'
import { solutionsBreadcrumbJsonLd } from '@/components/solutions/breadcrumbs'
import { Contact } from '@/components/contact'
import { Navbar } from '@/components/navbar'
import { getMarketCopy } from '@/lib/market-server'
import {
  contactHrefForSolution,
  getPublishedCaseStudies,
  getRelatedSolutions,
  type SolutionPage,
} from '@/lib/solutions'

type SolutionPageViewProps = {
  solution: SolutionPage
}

export async function SolutionPageView({ solution }: SolutionPageViewProps) {
  const copy = await getMarketCopy()
  const origin = copy.site.origin
  const areaServed = copy.home.schemaAreaServed
  const related = getRelatedSolutions(solution)
  const caseStudies = getPublishedCaseStudies(solution)
  const contactHref = contactHrefForSolution(solution.slug)
  const deepLayout = Boolean(solution.preferDeepLayout)
  const firstDeepSectionId = solution.deepSections?.[0]?.id
  const secondaryGoesToRelated =
    Boolean(solution.secondaryCtaLabel) &&
    /related/i.test(solution.secondaryCtaLabel ?? '')
  const secondaryHref = secondaryGoesToRelated
    ? '#related-solutions'
    : deepLayout && firstDeepSectionId
      ? `#${firstDeepSectionId}`
      : '#related-solutions'

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: solution.title,
    description: solution.metaDescription,
    provider: {
      '@type': 'ProfessionalService',
      name: 'XLS Experts',
      url: origin,
      areaServed: { '@type': 'Place', name: areaServed },
    },
    url: `${origin}${solution.href}`,
    areaServed: { '@type': 'Place', name: areaServed },
    serviceType: solution.title,
  }

  const breadcrumbSchema = solutionsBreadcrumbJsonLd(
    [{ name: solution.title, href: solution.href }],
    origin
  )

  const faqSchema =
    solution.faqs.length > 0 ? solutionFaqJsonLd(solution.faqs) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Navbar />
      <main className="pt-16">
        <SolutionHero
          breadcrumbLabel={solution.title}
          heading={solution.heroHeading}
          subheading={solution.heroSubheading}
          introduction={solution.heroIntroduction}
          primaryCta={{
            label: solution.primaryCtaLabel ?? 'Discuss your project',
            href: contactHref,
          }}
          secondaryCta={{
            label:
              solution.secondaryCtaLabel ??
              (deepLayout ? 'Explore the platform' : 'Explore related solutions'),
            href: secondaryHref,
          }}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Solutions', href: '/solutions' },
            { label: solution.title },
          ]}
        />
        <SolutionIntro
          heading={solution.introHeading}
          body={solution.introBody}
          items={solution.introItems}
        />
        {deepLayout && solution.deepSections ? (
          <SolutionDeepContent
            sections={solution.deepSections}
            featureGrid={solution.featureGrid}
            whyUs={solution.whyUs}
          />
        ) : (
          <>
            <ProblemSigns
              heading={solution.problemsHeading}
              problems={solution.problems}
            />
            <SolutionCapabilities
              heading={solution.capabilitiesHeading}
              capabilities={solution.capabilities}
            />
            <UseCaseGrid
              heading={solution.useCasesHeading}
              useCases={solution.useCases}
            />
            <TechnologyStrip
              heading={solution.technologyHeading}
              notes={solution.technologyNotes}
              technologies={solution.technologies}
            />
            {solution.approachHeading && solution.approachBody && (
              <section className="bg-white py-12">
                <div className="mx-auto max-w-3xl px-6">
                  <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
                    {solution.approachHeading}
                  </h2>
                  <div className="space-y-4">
                    {solution.approachBody.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="text-base leading-relaxed text-gray-600"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
        {!deepLayout && solution.processSteps.length > 0 && (
          <ProcessSteps
            heading={solution.processHeading}
            steps={solution.processSteps}
          />
        )}
        {deepLayout && (
          <>
            {!solution.skipUseCaseGrid && (
              <UseCaseGrid
                heading={solution.useCasesHeading}
                useCases={solution.useCases}
              />
            )}
            {!solution.skipProcessSteps && solution.processSteps.length > 0 && (
              <ProcessSteps
                heading={solution.processHeading}
                steps={solution.processSteps}
              />
            )}
          </>
        )}
        <RelatedCaseStudies studies={caseStudies} />
        <div id="related-solutions">
          <RelatedSolutions
            solutions={related}
            linkLabels={solution.relatedLinkLabels}
            extras={solution.relatedExtras}
            reading={solution.relatedReading}
          />
        </div>
        <SolutionFAQ faqs={solution.faqs} />
        <SolutionCTA
          heading={solution.ctaHeading}
          body={solution.ctaBody}
          href={contactHref}
          label={solution.ctaButtonLabel}
        />
        <Contact />
      </main>
    </>
  )
}
