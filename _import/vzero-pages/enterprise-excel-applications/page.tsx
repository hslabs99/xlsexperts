import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Enterprise Excel Applications New Zealand | XLS Experts',
  description:
    'Purpose-built enterprise Excel applications for large New Zealand organisations. VBA applications, cloud-hybrid Excel systems and database-connected solutions that scale across teams and departments.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/enterprise-excel-applications' },
  openGraph: {
    title: 'Enterprise Excel Applications New Zealand | XLS Experts',
    description: 'Purpose-built enterprise Excel applications for large NZ organisations. Scalable, governed, database-connected solutions.',
    url: 'https://www.xlsexperts.co.nz/enterprise-excel-applications',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'A spreadsheet that started simple has grown into a mission-critical application with no governance',
  'Multiple teams using different versions of the same tool — with no single source of truth',
  'No access control — anyone can change any part of the spreadsheet, including the logic',
  'Excel used to do something a proper application should do, but a rebuild isn\'t justified',
  'Existing Excel applications that need SQL back-ends as data volumes grow beyond Excel\'s limits',
  'A tool that works in one department but cannot scale to a business-wide deployment',
]

const examples = [
  { tag: 'Energy · VBA · SharePoint', title: 'Resource Planning Application', detail: 'Enterprise application for Contact Energy deployed via SharePoint — manages resource allocation, availability and capacity planning across multiple teams with role-based access and VBA-driven data logic.' },
  { tag: 'Finance · VBA · SQL', title: 'Fund Manager Reporting Suite', detail: 'AMP Financial Services: extensible reporting and workflow automation for fund management operations, integrating with EDI systems and database-backed data management.' },
  { tag: 'Insurance · SQL · VBA', title: 'Claims Analysis Platform', detail: 'NZI Insurance: web app front-end (.NET + SQL) feeds data into an Excel-based management analytics layer — combining familiar Excel interfaces with enterprise data infrastructure.' },
  { tag: 'Operations · VBA · EDI', title: 'SIMPRO Integration Tool', detail: 'Excel add-on for SIMPRO that extends the platform\'s capabilities for scheduling, pricing and asset management — deployed across a national maintenance business.' },
]

const steps = [
  {
    number: '01',
    title: 'Enterprise discovery',
    points: ['Users, departments and governance requirements', 'Data volumes, sources and integration points', 'Security: access control, versioning, audit trail requirements', 'Architecture decision: pure Excel, cloud-hybrid or VBA + SQL'],
    deliverable: 'Architecture recommendation and build plan with milestones.',
  },
  {
    number: '02',
    title: 'Agile enterprise build',
    points: ['Prototype to working MVP with frequent review cycles', 'Enterprise hardening: validation, logging, error handling, access control', 'Integration with SharePoint, SQL or external systems as required'],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Deployment and governance',
    points: ['Deployment documentation for IT', 'User training for admins and end users', 'Technical documentation for ongoing maintenance', 'Support and enhancement retainer available'],
    deliverable: null,
  },
]

const faqs = [
  { q: 'What makes an Excel tool an "enterprise application"?', a: 'An enterprise Excel application has structured access control, validated inputs, error handling, logging, documentation and a deployment mechanism. It is designed to be used by many people reliably over time — not just one person who built it.' },
  { q: 'When should we consider a VBA + SQL hybrid rather than pure Excel?', a: 'A VBA + SQL hybrid is appropriate when data volumes exceed Excel\'s reliable range (typically 100,000+ rows for performance-sensitive operations), when you need a central data store multiple users access simultaneously, or when other systems need to read from or write to the same data.' },
  { q: 'Can enterprise Excel applications be deployed via SharePoint?', a: 'Yes. SharePoint is a common deployment platform for enterprise Excel applications in NZ. It provides a familiar, IT-managed location, integrates with organisational security and access control, and allows controlled distribution across teams.' },
  { q: 'How do you handle access control in Excel applications?', a: 'We implement sheet and workbook protection, hidden admin functionality, user-level access via VBA login routines and, in SQL-hybrid applications, database-level access control. The appropriate level depends on the sensitivity of the data and the number of users.' },
  { q: 'What does ongoing support look like after delivery?', a: 'We offer a support retainer for enterprise applications — covering bug fixes, minor enhancements and version updates. For larger enhancements, we quote separately. We aim to build solutions that your own team can operate and maintain, with clear documentation.' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Enterprise Excel Applications',
  description: 'Purpose-built enterprise Excel applications for large New Zealand organisations. Scalable, governed, database-connected solutions.',
  provider: { '@type': 'ProfessionalService', name: 'XLS Experts', url: 'https://www.xlsexperts.co.nz', areaServed: { '@type': 'Country', name: 'New Zealand' } },
  url: 'https://www.xlsexperts.co.nz/enterprise-excel-applications',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Enterprise Excel Applications',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default function EnterpriseExcelApplicationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <main className="pt-16">

        <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">Enterprise Excel Applications</span>
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
              Enterprise-grade Excel applications for large NZ organisations.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Large organisations often need the flexibility and familiarity of Excel combined with the stability, access control and data management of a proper application. We design and build enterprise Excel applications for New Zealand organisations — pure VBA, cloud-hybrid or database-connected — that hold up under real enterprise conditions.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">Enterprise Excel application problems</h2>
            <p className="mb-12 text-center text-gray-500">The gaps between spreadsheet tools and enterprise requirements.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p) => (
                <div key={p} className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" />
                  <p className="text-sm leading-relaxed text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-2 text-center text-3xl font-bold text-gray-900 uppercase tracking-wide">NZ Enterprise Case Studies</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {examples.map((cs) => (
                <div key={cs.title} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                  <span className="mb-3 inline-block rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">{cs.tag}</span>
                  <h3 className="font-display mb-2 text-lg font-bold text-gray-900">{cs.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{cs.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">How we work</h2>
            <p className="mb-12 text-center text-gray-500">Enterprise delivery from architecture to live deployment.</p>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-gray-200 bg-gray-50 p-7 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#1a6b3c' }}>{step.number}</div>
                  <h3 className="font-display mb-4 text-lg font-bold text-gray-900">{step.title}</h3>
                  <ul className="space-y-2">
                    {step.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />{p}
                      </li>
                    ))}
                  </ul>
                  {step.deliverable && <p className="mt-4 rounded-lg bg-[#e8f5ee] px-3 py-2 text-xs font-medium text-[#1a6b3c]">Deliverable: {step.deliverable}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">Enterprise Excel development for large NZ organisations</h2>
            <p className="text-gray-600 leading-relaxed">We have designed and delivered enterprise Excel applications for some of New Zealand&apos;s largest organisations — including Contact Energy, AMP Financial Services and NZI Insurance. We work with IT teams, business analysts and end users across Auckland, Wellington, Christchurch and other New Zealand locations. Most delivery is remote with on-site engagement for discovery and deployment.</p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-gray-200 p-6">
                  <h3 className="font-display mb-2 font-bold text-gray-900">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 text-center" style={{ backgroundColor: '#1a6b3c' }}>
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">Ready to build something enterprise-grade?</h2>
            <p className="mb-8 text-white/80">Tell us about your requirements and we will scope a solution that fits your organisation.</p>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50">
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
