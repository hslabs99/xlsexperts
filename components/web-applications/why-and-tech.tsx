import Link from 'next/link'
import {
  webAppAiCapabilities,
  webAppIntegrations,
  webAppSecurityTopics,
  webAppTechGroups,
  webAppWhyPoints,
} from '@/lib/web-applications-page'
import {
  Body,
  BulletGrid,
  Intro,
  SectionHeading,
  SectionShell,
} from './shared'

export function WhyXLSExperts() {
  return (
    <SectionShell>
      <SectionHeading>Web development grounded in business understanding</SectionHeading>
      <Intro>
        XLS Experts is not merely a generic web development agency. We combine detailed
        business-process understanding, more than 20 years of spreadsheet and operational
        application experience, financial modelling and data expertise, workflow and reporting
        knowledge, modern web application development, cloud databases and infrastructure, and rapid
        AI-assisted development using Cursor.
      </Intro>
      <Body>
        Many web developers can write software. Far fewer can examine an existing operational
        process, understand the calculations, reporting, workflows, approvals, exceptions and
        business rules, and then turn that knowledge into a practical working application.
      </Body>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {webAppWhyPoints.map((point) => (
          <div key={point.title} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="font-display mb-2 text-base font-bold text-gray-900">{point.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{point.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

export function TechnologyStack() {
  return (
    <SectionShell id="technology" alt>
      <SectionHeading>Development technology</SectionHeading>
      <Intro>
        Technology serves the application—not the other way around. We select the architecture
        according to the application, its users, security requirements, expected scale, integrations
        and the client’s existing technology environment.
      </Intro>
      <Body>
        Cursor is our AI-assisted development environment. It is not a JavaScript framework. Next.js
        and React are web development technologies used in many of our modern applications.
      </Body>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {webAppTechGroups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="font-display mb-3 text-base font-bold text-gray-900">{group.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-medium text-[#1a6b3c]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm leading-relaxed text-gray-500">
        Not every application uses every technology listed. We previously developed applications
        using Microsoft .NET and SQL-based architectures and can support or integrate with Microsoft
        environments where appropriate.
      </p>
    </SectionShell>
  )
}

export function AIApplicationsSection() {
  return (
    <SectionShell>
      <SectionHeading>Building intelligence into business applications</SectionHeading>
      <Intro>
        Modern applications may include AI-supported capabilities where they deliver practical
        value. Important decisions may still require human review. We do not promise fully
        autonomous systems.
      </Intro>
      <BulletGrid cols={3} items={[...webAppAiCapabilities]} />
      <Body>
        AI should be applied carefully—supporting document handling, classification, search,
        drafting and workflow assistance rather than replacing accountability for business-critical
        outcomes.
      </Body>
      <p className="text-sm text-gray-500">
        Related:{' '}
        <Link
          href="/ai-workflow-and-business-process-automation"
          className="font-medium text-[#1a6b3c] hover:underline"
        >
          AI Workflow and Business Process Automation
        </Link>
      </p>
    </SectionShell>
  )
}

export function SecurityGovernanceSection() {
  return (
    <SectionShell alt>
      <SectionHeading>Security and governance</SectionHeading>
      <Intro>
        Exact security requirements depend on the sensitivity of the data, user types, client IT
        policies, industry obligations, application risk and hosting environment. We do not claim
        formal certifications that XLS Experts does not hold. We do design practical controls that
        match the risk of the application.
      </Intro>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {webAppSecurityTopics.map((topic) => (
          <div key={topic.title} className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="font-display mb-2 text-base font-bold text-gray-900">{topic.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{topic.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

export function IntegrationSection() {
  return (
    <SectionShell>
      <SectionHeading>Integrations</SectionHeading>
      <Intro>
        A web application does not need to stand alone. Integrations can be assessed or implemented
        where suitable—depending on available APIs, permissions, licensing and the quality of the
        source system. We do not claim a completed integration with every named platform.
      </Intro>
      <BulletGrid cols={3} items={[...webAppIntegrations]} />
      <Body>
        Feasibility is confirmed during discovery. Sometimes structured file exchange is the
        practical first step; sometimes a direct API connection is available and appropriate.
      </Body>
    </SectionShell>
  )
}
