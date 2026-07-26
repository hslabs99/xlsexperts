import {
  webAppCostFactors,
  webAppProcessSteps,
  webAppStagedBuild,
} from '@/lib/web-applications-page'
import {
  Body,
  BulletGrid,
  Intro,
  MidCta,
  SectionHeading,
  SectionShell,
} from './shared'

export function DevelopmentProcess() {
  return (
    <SectionShell id="development-process" alt>
      <SectionHeading center>Our delivery process</SectionHeading>
      <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
        Application development is collaborative. Important business rules are often uncovered and
        refined while users interact with working versions—not only from a written specification.
      </p>
      <ol className="space-y-5">
        {webAppProcessSteps.map((step) => (
          <li
            key={step.number}
            className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-7"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: '#1a6b3c' }}
            >
              {step.number}
            </span>
            <div>
              <h3 className="font-display mb-3 text-lg font-bold text-gray-900">{step.title}</h3>
              <ul className="space-y-2">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                    {item}
                  </li>
                ))}
              </ul>
              {step.note && (
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{step.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <MidCta
        title="Start with a consultation"
        body="We can map your idea, users and constraints into a practical first release—without requiring a massive platform on day one."
        primary={{ label: 'Start With a Consultation', href: '#consultation' }}
      />
    </SectionShell>
  )
}

export function StartSmallSection() {
  return (
    <SectionShell>
      <SectionHeading>You do not need to build everything at once</SectionHeading>
      <Intro>
        Many clients worry about risk and cost. A project can begin with one key workflow, one user
        group, one business unit, one portal, one field process, one reporting requirement or one
        prototype—then expand after validation.
      </Intro>
      <Body>Possible staged development includes:</Body>
      <BulletGrid cols={3} items={[...webAppStagedBuild]} />
      <Body>
        Starting small reduces perceived risk. It also produces earlier feedback from real users,
        which usually improves the quality of later stages.
      </Body>
    </SectionShell>
  )
}

export function CostFactorsSection() {
  return (
    <SectionShell alt>
      <SectionHeading>What determines the cost of a web application?</SectionHeading>
      <Intro>
        A focused internal application can be very different in scope from a customer-facing SaaS
        platform. Cost is driven by complexity and risk—not by marketing packages.
      </Intro>
      <BulletGrid cols={3} items={[...webAppCostFactors]} />
      <Body>
        An initial consultation helps identify whether the idea is suitable for a web application,
        better addressed through Excel or automation, suitable for staged development, or dependent
        on further technical discovery. We do not publish fixed “apps from $X” pricing, because
        meaningful estimates require understanding the process.
      </Body>
    </SectionShell>
  )
}

export function NZCoverageSection() {
  return (
    <SectionShell>
      <SectionHeading>Web applications for New Zealand businesses</SectionHeading>
      <Intro>
        XLS Experts works with organisations throughout Auckland, Wellington, Christchurch,
        Hamilton, Tauranga and other regions of New Zealand. This page is currently intended
        primarily for the New Zealand market—supporting strong local relevance for custom web
        application development NZ searches while remaining useful to any visitor evaluating a
        practical delivery partner.
      </Intro>
      <Body>
        Projects are commonly delivered through a combination of remote workshops, screen sharing,
        regular demonstrations, online testing and structured review sessions, with onsite work
        where appropriate. Distance does not prevent clear collaboration when demos and feedback
        loops are regular.
      </Body>
    </SectionShell>
  )
}
