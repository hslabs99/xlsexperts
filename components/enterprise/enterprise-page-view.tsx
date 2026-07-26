import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Breadcrumbs } from '@/components/solutions/breadcrumbs'
import { Contact } from '@/components/contact'
import {
  enterpriseCaseStudies,
  enterpriseDeliverySteps,
  enterpriseFaqs,
  enterpriseFraming,
  enterpriseHeroStatement,
  enterpriseQualities,
  enterpriseRelatedLinks,
  enterpriseUseCases,
} from '@/lib/enterprise-page'

function SectionShell({
  id,
  alt,
  children,
  narrow,
}: {
  id?: string
  alt?: boolean
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <section id={id} className={alt ? 'bg-gray-50 py-16 sm:py-20' : 'bg-white py-16 sm:py-20'}>
      <div className={`mx-auto px-6 ${narrow ? 'max-w-3xl' : 'max-w-5xl'}`}>{children}</div>
    </section>
  )
}

function SectionHeading({
  children,
  center,
}: {
  children: ReactNode
  center?: boolean
}) {
  return (
    <h2
      className={`font-display mb-4 text-3xl font-bold text-gray-900 ${center ? 'text-center' : ''}`}
    >
      {children}
    </h2>
  )
}

function Intro({ children }: { children: ReactNode }) {
  return <p className="mb-6 text-base leading-relaxed text-gray-600">{children}</p>
}

function Body({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-base leading-relaxed text-gray-600">{children}</p>
}

function BulletGrid({ items, cols = 2 }: { items: string[]; cols?: 2 | 3 }) {
  return (
    <ul
      className={`mt-6 grid gap-3 ${cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700"
        >
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function Highlight({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-10 rounded-2xl border-l-4 border-[#1a6b3c] bg-[#e8f5ee] px-6 py-5">
      <p className="font-display text-xl font-bold leading-snug text-gray-900 md:text-2xl">
        {children}
      </p>
    </blockquote>
  )
}

export function EnterprisePageView() {
  return (
    <main className="pt-16">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 sm:py-24"
        style={{
          background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Enterprise', href: '/enterprise' },
              { label: 'Excel in Enterprise Operational Applications' },
            ]}
          />
          <p className="mb-5 max-w-2xl text-sm leading-relaxed text-white/75">
            {enterpriseFraming}
          </p>
          <h1 className="font-display mb-5 max-w-4xl text-3xl font-bold leading-tight text-white text-balance md:text-4xl lg:text-[2.75rem]">
            Excel in Enterprise Operational Applications
          </h1>
          <p className="font-display mb-6 max-w-3xl text-2xl font-semibold leading-snug text-white/95 text-balance md:text-3xl">
            {enterpriseHeroStatement}
          </p>
          <div className="mb-8 max-w-2xl space-y-4 text-base leading-relaxed text-white/80 md:text-lg">
            <p>
              When Excel becomes business-critical—for pricing, forecasting, reporting, project
              controls, planning or operational workflows—a workbook is no longer enough.
            </p>
            <p>
              XLS Experts designs and develops robust Excel-based operational applications that
              reduce manual work, improve accuracy, integrate with enterprise systems and remain
              maintainable over the long term.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Discuss your enterprise requirements
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#enterprise-experience"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              View enterprise project experience
            </a>
          </div>
        </div>
      </section>

      {/* Excel's role */}
      <SectionShell id="excel-role">
        <SectionHeading>Excel’s role in the enterprise</SectionHeading>
        <Intro>
          Excel remains an important enterprise development and operational platform when
          applications are designed, governed, documented and maintained appropriately. Large
          organisations across energy, financial services, insurance, infrastructure, government and
          national businesses continue to rely on Excel for pricing, forecasting, financial
          modelling, project controls, operational planning, resource allocation, reporting, data
          processing, analysis, scheduling, workflow automation, business rules, specialist
          calculations and system import and export preparation.
        </Intro>
        <Body>
          The issue is not whether Excel is being used. The issue is whether it is being treated as
          an informal workbook or engineered as a governed operational application.
        </Body>
        <Body>
          Enterprise teams value Excel because it is familiar, flexible, widely deployed and fast to
          adapt. It is strong for calculations and modelling, effective for data analysis, accessible
          to operational and finance users, well suited to specialist applications, and capable of
          connecting with databases, APIs and other systems.
        </Body>
        <Body>
          Excel is often the practical interface between enterprise systems and the people who need
          to make decisions, perform analysis or run specialised operational processes. As
          spreadsheets become business-critical, they require a higher level of engineering.
        </Body>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
            <h3 className="font-display mb-4 text-lg font-bold text-gray-900">
              An informal workbook
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[
                'Built by one user',
                'Poorly documented',
                'Dependent on manual processes',
                'Difficult to support',
                'Vulnerable to accidental changes',
                'Uncontrolled versions',
                'Limited error handling',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#1a6b3c]/30 bg-[#e8f5ee] p-7">
            <h3 className="font-display mb-4 text-lg font-bold text-gray-900">
              A governed Excel application
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-700">
              {[
                'Defined business purpose',
                'Controlled inputs',
                'Structured business logic',
                'Validation and error handling',
                'Documentation and version control',
                'Testing and user acceptance',
                'Deployment controls, support ownership and maintainable code',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-base leading-relaxed text-gray-600">
          XLS Experts turns business-critical spreadsheets into robust, maintainable and
          well-governed applications that can operate confidently within enterprise environments.
        </p>
      </SectionShell>

      {/* Where XLS fits */}
      <SectionShell id="where-we-fit" alt>
        <SectionHeading>Where XLS Experts fits</SectionHeading>
        <Intro>
          Large organisations already have substantial investments in core platforms such as SAP, JD
          Edwards, Simpro, TechnologyOne, Microsoft 365, SharePoint, SQL Server, PostgreSQL, internal
          databases, industry-specific ERP systems, finance systems, asset management systems,
          operational platforms, and web services and APIs.
        </Intro>
        <Body>
          These systems are often effective at managing core transactions and governed data. However,
          they may not provide the agility required by individual business units, specialist teams or
          changing operational requirements. New functionality within an ERP may involve long delivery
          cycles, competing internal priorities, significant development costs, vendor dependency,
          complex approval processes, release scheduling, limited flexibility, or broad functionality
          that does not precisely match operational needs.
        </Body>
        <Body>
          XLS Experts develops specialist operational applications around these systems. These
          applications may handle data preparation, import and export processes, pricing
          calculations, forecasting, project controls, scheduling, resource planning, operational
          analysis, management reporting, scenario modelling, document generation, workflow controls,
          exception handling, customer-specific outputs and internal business rules.
        </Body>
        <Highlight>Keep the core platform. Add the operational agility around it.</Highlight>
        <Body>
          We extend enterprise platforms rather than replacing them—preserving the organisation’s
          investment in core systems while delivering the specialist capability that business units
          need more quickly.
        </Body>
        <p className="text-sm text-gray-500">
          Related:{' '}
          <Link href="/excel-integrations" className="font-medium text-[#1a6b3c] hover:underline">
            Excel Integrations (SQL, API, etc.)
          </Link>
          {' · '}
          <Link
            href="/ai-workflow-and-business-process-automation"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            Business Process Automation
          </Link>
        </p>
      </SectionShell>

      {/* What is an enterprise operational application */}
      <SectionShell id="operational-applications">
        <SectionHeading>Enterprise operational applications</SectionHeading>
        <Intro>
          An enterprise operational application is a focused application that supports a defined
          business process or operational requirement and operates within the organisation’s broader
          technology landscape.
        </Intro>
        <Body>These applications may be:</Body>
        <BulletGrid
          items={[
            'Excel and VBA applications',
            'Excel connected to SQL databases',
            'Excel integrated with SharePoint or Microsoft 365',
            'Hybrid Excel and cloud applications',
            'Excel interfaces connected to APIs',
            'Data-processing applications',
            'Specialist planning and modelling systems',
            'Controlled reporting tools',
            'Import and export workbenches',
            'Web applications with Excel analysis components',
          ]}
        />
        <div className="mt-10">
          <Body>
            The correct architecture depends on the requirement. XLS Experts does not assume every
            enterprise process should remain entirely in Excel. We assess number of users, data
            volumes, collaboration requirements, security, performance, existing infrastructure,
            internal IT capability, deployment constraints, integration requirements, business
            continuity, ownership, long-term support and total cost of ownership.
          </Body>
          <Body>
            The resulting solution may remain within Excel, use Excel as the user interface, connect
            Excel to structured data, or move selected functions into a cloud or web application. The
            goal is not to promote a particular technology. The goal is to design the simplest
            reliable architecture that fits the enterprise environment.
          </Body>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Related:{' '}
          <Link href="/web-applications" className="font-medium text-[#1a6b3c] hover:underline">
            Web Applications
          </Link>
          {' · '}
          <Link
            href="/excel-vba-macro-development"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            Excel VBA/Macro Development
          </Link>
        </p>
      </SectionShell>

      {/* Use cases */}
      <SectionShell id="use-cases" alt>
        <SectionHeading center>Typical enterprise use cases</SectionHeading>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
          Governed Excel operational applications commonly support these business-critical processes
          across large New Zealand organisations.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {enterpriseUseCases.map((uc) => (
            <div
              key={uc.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-display mb-2 text-base font-bold text-gray-900">{uc.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{uc.body}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Governance */}
      <SectionShell id="governance">
        <SectionHeading>Governance and control</SectionHeading>
        <Intro>
          Enterprise applications require controls beyond simply making a workbook functional. When
          Excel supports business-critical processes, governance determines whether the organisation
          can rely on the application over time.
        </Intro>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            {
              title: 'Controlled inputs',
              body: 'Inputs should be clearly identified, validated and separated from calculations and outputs.',
            },
            {
              title: 'Protected business logic',
              body: 'Important formulas, rules and code should not be casually editable by users.',
            },
            {
              title: 'Version management',
              body: 'There should be a controlled approach to releases, deployment and updates.',
            },
            {
              title: 'Access and ownership',
              body: 'The organisation should know who owns the application, who supports it and who is authorised to make changes.',
            },
            {
              title: 'Auditability',
              body: 'Important assumptions, calculations and processing steps should be understandable and reviewable.',
            },
            {
              title: 'Exception management',
              body: 'Applications should identify and handle missing data, invalid values and unexpected conditions.',
            },
            {
              title: 'Logging',
              body: 'Where appropriate, applications should record processing activity, exceptions and important user actions.',
            },
            {
              title: 'Data integrity',
              body: 'Imports, transformations and outputs should be validated to reduce the risk of incomplete or incorrect processing.',
            },
            {
              title: 'Deployment controls',
              body: 'Updates should be tested and released in a controlled manner.',
            },
            {
              title: 'Configuration',
              body: 'Where practical, business rules and settings should be configurable rather than hidden throughout code.',
            },
            {
              title: 'Security',
              body: 'Applications should operate within the organisation’s existing security policies and approved environments.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-5">
              <h3 className="font-display mb-2 text-base font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Related:{' '}
          <Link href="/spreadsheet-auditing" className="font-medium text-[#1a6b3c] hover:underline">
            Spreadsheet Auditing
          </Link>
        </p>
      </SectionShell>

      {/* Enterprise-ready development */}
      <SectionShell id="qualities" alt>
        <SectionHeading center>Enterprise-ready development</SectionHeading>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
          We design Excel operational applications around qualities that matter to enterprise buyers:
          reliability in production, clarity for future support, and the ability to evolve without
          destabilising what already works.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {enterpriseQualities.map((q) => (
            <div
              key={q.label}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-display mb-2 text-lg font-bold text-[#1a6b3c]">{q.label}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{q.detail}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Documentation */}
      <SectionShell id="documentation">
        <SectionHeading>Documentation</SectionHeading>
        <Intro>
          Documentation is a major enterprise requirement. It is scaled to the size and risk of the
          project—and it is not added as an afterthought. Documentation is part of making the
          application governable and supportable.
        </Intro>
        <Body>Potential documentation may include:</Body>
        <BulletGrid
          cols={3}
          items={[
            'Scope and requirements',
            'Assumptions',
            'Solution architecture',
            'Functional specifications',
            'Business rules',
            'Data source definitions',
            'Field mappings',
            'Import and export specifications',
            'User instructions',
            'Technical documentation',
            'Code documentation',
            'Configuration guidance',
            'Deployment instructions',
            'Testing records',
            'User Acceptance Testing material',
            'Support and maintenance notes',
            'Known limitations',
            'Enhancement pathways',
          ]}
        />
      </SectionShell>

      {/* Testing */}
      <SectionShell id="testing" alt>
        <SectionHeading>Testing and User Acceptance</SectionHeading>
        <Intro>
          Enterprise solutions are tested in proportion to the project’s importance, complexity and
          risk. The exact level of testing depends on those factors—we do not claim formal testing
          certifications, but we do apply practical, structured validation before release.
        </Intro>
        <div className="mt-8 space-y-5">
          {[
            {
              title: 'Developer testing',
              body: 'Testing individual functions, calculations, workflows and edge cases during development.',
            },
            {
              title: 'Data validation',
              body: 'Testing against representative data volumes, historical datasets and known outcomes.',
            },
            {
              title: 'Exception testing',
              body: 'Testing missing values, incorrect formats, unusual cases and interrupted processes.',
            },
            {
              title: 'Performance testing',
              body: 'Assessing processing speed and workbook responsiveness with realistic volumes.',
            },
            {
              title: 'Regression testing',
              body: 'Ensuring enhancements do not break existing functionality.',
            },
            {
              title: 'User Acceptance Testing',
              body: 'Supporting nominated business users through a structured review of the application against agreed requirements.',
            },
            {
              title: 'Issue resolution',
              body: 'Recording, prioritising and addressing issues identified during testing.',
            },
            {
              title: 'Release approval',
              body: 'Confirming that the agreed solution is ready for controlled deployment.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 border-b border-gray-200 pb-5 last:border-0">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
              <div>
                <h3 className="font-display mb-1 font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* UX */}
      <SectionShell id="user-experience">
        <SectionHeading>User experience in enterprise applications</SectionHeading>
        <Intro>
          Enterprise-grade does not need to mean difficult to use. Applications should be designed
          around the real workflow of the users.
        </Intro>
        <BulletGrid
          items={[
            'Clear navigation',
            'Consistent screen layouts',
            'Controlled inputs',
            'Helpful instructions',
            'Status messages',
            'Error messages that explain the problem',
            'Reduced copy-and-paste',
            'Automated repetitive steps',
            'Role-appropriate outputs',
            'Familiar Excel interaction where this benefits adoption',
            'Minimising disruption to existing workflows',
          ]}
        />
        <p className="mt-8 text-base leading-relaxed text-gray-600">
          Early working releases allow users to confirm that the application reflects how work is
          actually performed—before the solution is hardened for controlled deployment.
        </p>
      </SectionShell>

      {/* Maintainability */}
      <SectionShell id="maintainability" alt>
        <SectionHeading>Maintainability and longevity</SectionHeading>
        <Intro>
          Enterprise applications may remain in use for many years. They must therefore be built for
          future support and change—so the organisation is not left dependent on a single undocumented
          workbook.
        </Intro>
        <Body>
          A common enterprise concern is: “What happens when the original developer is no longer
          involved?” XLS Experts aims to leave applications that can be understood, supported and
          enhanced by future developers or internal technical teams.
        </Body>
        <BulletGrid
          items={[
            'Modular VBA architecture',
            'Readable code and clear procedures',
            'Consistent naming',
            'Separation of interface, processing and business rules',
            'Reduced hard-coded logic',
            'Centralised configuration',
            'Error handling and logging',
            'Commenting where useful',
            'Technical documentation',
            'Controlled enhancement processes',
            'Compatibility considerations',
            'Future migration pathways',
          ]}
        />
        <p className="mt-8 text-sm text-gray-500">
          Related:{' '}
          <Link
            href="/vba-to-office-scripts-migration"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            VBA to Office Scripts Migration
          </Link>
        </p>
      </SectionShell>

      {/* Integration */}
      <SectionShell id="integration">
        <SectionHeading>Integration with enterprise systems</SectionHeading>
        <Intro>
          Enterprise Excel applications often sit between users and larger systems. Integration can
          range from structured CSV exchange through to databases and APIs, depending on the
          organisation’s environment—we do not imply direct integrations where only file-based data
          exchange may be appropriate.
        </Intro>
        <Body>Applications may:</Body>
        <BulletGrid
          items={[
            'Import CSV or text exports',
            'Read and write database data',
            'Query SQL',
            'Consume API data',
            'Prepare ERP upload files',
            'Validate bulk transactions',
            'Transform external data structures',
            'Reconcile data between systems',
            'Generate controlled outputs',
            'Support EDI-style data exchanges',
            'Connect with SharePoint or Microsoft 365',
            'Use governed file locations and naming standards',
          ]}
        />
        <Body>
          Common platforms include SAP, JD Edwards, Simpro, SQL Server, PostgreSQL, SharePoint,
          Microsoft 365, internal APIs, cloud databases and industry-specific platforms.
        </Body>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-7">
          <h3 className="font-display mb-3 text-lg font-bold text-gray-900">
            A recurring enterprise pattern
          </h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Enterprise teams frequently export data from a core platform, perform specialist
            validation, calculation, planning or analysis, and then prepare the resulting data for
            re-upload or further processing. XLS Experts formalises and governs this process so that
            it becomes more reliable, repeatable and supportable.
          </p>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Related:{' '}
          <Link href="/excel-integrations" className="font-medium text-[#1a6b3c] hover:underline">
            Excel Integrations
          </Link>
          {' · '}
          <Link
            href="/solutions/asset-maintenance-operations-solutions"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            Asset Maintenance Operations
          </Link>
        </p>
      </SectionShell>

      {/* Hybrid */}
      <SectionShell id="hybrid" alt>
        <SectionHeading>Hybrid architectures</SectionHeading>
        <Intro>
          Some enterprise applications combine several technologies. Hybrid solutions can preserve
          users’ familiarity with Excel while addressing limitations around data volume,
          collaboration, security or multi-user access.
        </Intro>
        <BulletGrid
          items={[
            'Excel as the user interface with SQL as the data store',
            'Excel and VBA connected to SharePoint',
            'Excel processing data from ERP exports',
            'Excel linked to web services',
            'A web application collecting data for later Excel analysis',
            'Cloud databases supporting multiple users',
            'Excel retained as the modelling or reporting layer',
            'Web interfaces used for field or remote users',
            'Microsoft 365 supporting document or workflow collaboration',
          ]}
        />
      </SectionShell>

      {/* Delivery approach */}
      <SectionShell id="delivery">
        <SectionHeading center>Our enterprise delivery approach</SectionHeading>
        <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-relaxed text-gray-600">
          Delivery can align with the organisation’s internal governance and project management
          requirements. A typical engagement follows six stages.
        </p>
        <ol className="space-y-6">
          {enterpriseDeliverySteps.map((step) => (
            <li
              key={step.number}
              className="flex gap-5 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-7"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: '#1a6b3c' }}
              >
                {step.number}
              </span>
              <div>
                <h3 className="font-display mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionShell>

      {/* Working with IT */}
      <SectionShell id="working-with-it" alt>
        <SectionHeading>Working with enterprise IT</SectionHeading>
        <Intro>
          XLS Experts works alongside internal IT teams, enterprise architects, security teams,
          database administrators, Microsoft 365 administrators, project managers, business analysts,
          finance teams, operational subject-matter experts and external vendors.
        </Intro>
        <Body>
          We respect enterprise IT governance. The aim is not to position a business unit against IT,
          but to deliver governed operational applications within approved environments.
        </Body>
        <BulletGrid
          items={[
            'Working within approved environments',
            'Respecting data access controls',
            'Documenting data flows',
            'Clarifying ownership',
            'Avoiding unnecessary technology',
            'Aligning with deployment requirements',
            'Designing for supportability',
            'Coordinating integration responsibilities',
            'Providing clear technical information',
          ]}
        />
      </SectionShell>

      {/* Risk */}
      <SectionShell id="risk">
        <SectionHeading>Risk reduction</SectionHeading>
        <Intro>
          Structured development, testing, documentation and governance reduce operational risk in
          business-critical Excel processes.
        </Intro>
        <Body>Potential risk areas include:</Body>
        <BulletGrid
          cols={3}
          items={[
            'Single-person dependency',
            'Uncontrolled workbook versions',
            'Hidden business rules',
            'Manual copy-and-paste',
            'Inconsistent calculations',
            'Incomplete data',
            'Broken links',
            'Unsupported code',
            'Poor documentation',
            'Uncontrolled changes',
            'Slow processing',
            'Lack of ownership',
            'Business interruption',
            'Inability to audit assumptions',
          ]}
        />
        <p className="mt-8 text-base leading-relaxed text-gray-600">
          Addressing these risks is a core part of treating Excel as an enterprise operational
          platform—not an informal spreadsheet habit.
        </p>
      </SectionShell>

      {/* Case studies */}
      <SectionShell id="enterprise-experience" alt>
        <SectionHeading center>Enterprise project experience</SectionHeading>
        <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-gray-600">
          Across financial services, insurance, energy and asset maintenance, the same requirement
          appears repeatedly: enterprise teams need governed operational applications that deliver
          specialist functionality more quickly than changes to core platforms.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {enterpriseCaseStudies.map((cs) => (
            <article
              key={cs.title + cs.client}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">
                  {cs.category}
                </span>
                <span className="text-xs font-medium text-gray-400">{cs.tags}</span>
              </div>
              <h3 className="font-display mb-1 text-lg font-bold text-gray-900">{cs.title}</h3>
              <p className="mb-3 text-sm font-medium text-gray-500">{cs.client}</p>
              <p className="flex-1 text-sm leading-relaxed text-gray-600">{cs.body}</p>
              {cs.href && (
                <Link
                  href={cs.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1a6b3c] hover:underline"
                >
                  Related solution <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Related solutions:{' '}
          <Link
            href="/solutions/project-costing-financial-modelling"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            Project Costing & Financial Modelling
          </Link>
          {' · '}
          <Link
            href="/solutions/resource-planning-scheduling"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            Resource Planning & Scheduling
          </Link>
          {' · '}
          <Link
            href="/solutions/dashboards-business-intelligence"
            className="font-medium text-[#1a6b3c] hover:underline"
          >
            Dashboards & Business Intelligence
          </Link>
        </p>
      </SectionShell>

      {/* Who this is for */}
      <SectionShell id="who-for">
        <SectionHeading>Who this page is for</SectionHeading>
        <Intro>
          XLS Experts is a good fit for organisations that already use enterprise software and need
          specialised functionality around existing platforms—particularly where business-critical
          Excel processes require stronger governance, documentation and long-term maintainability.
        </Intro>
        <BulletGrid
          items={[
            'Already use enterprise software',
            'Need specialised functionality around existing platforms',
            'Depend on business-critical Excel processes',
            'Require strong documentation',
            'Expect User Acceptance Testing',
            'Need long-term maintainability',
            'Require controlled inputs and business rules',
            'Need to reduce manual processing',
            'Need to integrate data from multiple systems',
            'Value practical, iterative delivery',
            'Require collaboration between business teams and IT',
            'Need software that can evolve over time',
          ]}
        />
      </SectionShell>

      {/* When Excel is / isn't right */}
      <SectionShell id="when-excel" alt>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading>When Excel is the right platform</SectionHeading>
            <Intro>
              Excel may be the right choice where the process benefits from familiarity, modelling
              strength and practical delivery speed—and where the application can be governed and
              deployed appropriately.
            </Intro>
            <ul className="space-y-3">
              {[
                'Users already work extensively in Excel',
                'The process involves modelling or analysis',
                'Specialist calculations are central',
                'A relatively focused user group is involved',
                'Fast delivery is important',
                'The application needs to work closely with existing spreadsheets',
                'Excel offers the most practical user interface',
                'The system can be governed and deployed appropriately',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-gray-700">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading>When Excel is not enough</SectionHeading>
            <Intro>
              Balanced judgement matters. Excel may not be sufficient where another architecture
              better serves collaboration, scale or system-of-record requirements.
            </Intro>
            <ul className="mb-6 space-y-3">
              {[
                'Many users need to edit the same transactional data',
                'The application must act as the central system of record',
                'Large-scale permissions are required',
                'Data volumes exceed practical workbook limits',
                'Remote or mobile access is essential',
                'Real-time multi-user collaboration is required',
                'The process requires a central database',
                'Security or deployment requirements indicate another platform',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed text-gray-600">
              In these cases, XLS Experts may recommend SQL-backed architecture, cloud databases, web
              applications, hybrid Excel and web applications, Microsoft 365 components or API-based
              integrations. We recommend the right architecture rather than forcing every requirement
              into Excel.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Support */}
      <SectionShell id="support">
        <SectionHeading>Enterprise support and continuous improvement</SectionHeading>
        <Intro>
          Enterprise applications often evolve. Support arrangements can be structured around the
          organisation’s needs and the importance of the application.
        </Intro>
        <BulletGrid
          cols={3}
          items={[
            'Issue resolution',
            'Minor enhancements',
            'New reporting requirements',
            'Business rule changes',
            'Data-source changes',
            'Integration updates',
            'Performance improvements',
            'Compatibility updates',
            'Documentation updates',
            'User training',
            'New modules',
            'Migration planning',
          ]}
        />
      </SectionShell>

      {/* FAQ */}
      <SectionShell id="faq" alt narrow>
        <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {enterpriseFaqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-gray-200 bg-white p-6 open:shadow-sm"
            >
              <summary className="font-display cursor-pointer list-none font-bold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {faq.question}
                  <span className="mt-0.5 shrink-0 text-[#1a6b3c] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </SectionShell>

      {/* Related links */}
      <SectionShell id="related">
        <SectionHeading center>Explore related services and solutions</SectionHeading>
        <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {enterpriseRelatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-5 py-4 text-sm font-medium text-gray-800 transition-colors hover:border-[#1a6b3c]/40 hover:bg-[#e8f5ee]/50"
              >
                {link.label}
                <ArrowRight className="h-4 w-4 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* Final CTA */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#1a6b3c' }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display mb-4 text-3xl font-bold text-white">
            Discuss your enterprise application requirements
          </h2>
          <p className="mb-8 text-base leading-relaxed text-white/85">
            Tell us about the process, workbook or operational requirement your organisation relies
            on today. We can review where Excel remains the right platform, where stronger governance
            is required, and where integration, structured data or a hybrid architecture would
            provide a more reliable long-term solution.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50"
            >
              Book an enterprise consultation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Discuss an existing application
            </a>
          </div>
        </div>
      </section>

      <Contact />
    </main>
  )
}
