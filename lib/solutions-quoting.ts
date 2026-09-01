import { QUOTING_PILLARS } from './quoting-pillars'
import type { SolutionPage } from './solutions'

export const quotingEstimatingSolution = {
  slug: 'quoting-estimating-systems',
  href: '/solutions/quoting-estimating-systems',
  title: 'Quoting & Estimating Systems',
  shortTitle: 'Quoting systems',
  navLabel: 'Quoting & Estimating Systems',
  summary:
    'Replace manual quoting processes with structured estimating systems that improve speed, consistency and control.',
  exampleUses: [
    'Construction estimates',
    'Manufacturing quotations',
    'Service pricing',
    'Proposal and document generation',
  ],
  icon: 'quoting',
  metaTitle: 'Quoting & Estimating Systems NZ',
  metaDescription:
    'Structured quoting and estimating systems for New Zealand businesses — construction estimates, manufacturing quotations, margins and proposal generation.',
  heroHeading: 'Quotes that are fast, consistent and commercially controlled',
  heroIntroduction:
    'XLS Experts creates structured quoting and estimating systems that improve accuracy, speed and consistency — from advanced Excel estimators through to cloud quoting platforms with approvals and CRM links.',
  heroAfterIntroduction: [
    'Most businesses that come to us have already tried off-the-shelf quoting software and found it almost fits — but forces their pricing to work the software\'s way instead of theirs. We build custom quoting and estimating tools around how your business actually prices work: in Excel when that\'s the practical answer, or as a connected web-based quoting application when you need multiple users, approval steps and live CRM or Xero links. Whether you call it a quoting tool, an estimating system, a job-costing spreadsheet or a pricing calculator, the goal is the same — fast, consistent, commercially controlled quotes that reflect your real costs and protect your margin.',
  ],
  introHeading: 'Common quoting problems we solve',
  introBody: [
    'When quotes take too long, pricing differs between staff, or margins are applied inconsistently, the business loses both time and commercial control.',
    'Solutions may range from an advanced Excel estimator to a fully cloud-based quoting platform. We match the design to quote volume, complexity and how proposals are issued.',
  ],
  afterIntroSections: [
    {
      id: 'when-off-the-shelf-isnt-enough',
      heading: "When off-the-shelf quoting software isn't enough",
      tone: 'white',
      body: [
        "Products like Xero, Simpro, Buildxact and NextMinute cover standard quoting well. If one of them fits how you price, you should use it — and we'll tell you so for free.",
        "The businesses we help are usually the ones where standard software doesn't quite fit, because their pricing carries logic no generic tool captures: cutting-stock optimisation, complex bill-of-materials, tiered labour rates, project-specific margin rules, or estimates that pull from several sources at once. Forcing that into a rigid template means either overquoting and losing the job, or underquoting and losing the margin.",
        "A custom quoting system is worth it when your estimating is specific enough that nothing off the shelf quite fits, and where a faster, more accurate quote directly protects your win rate. We build the tool around your process rather than the other way round — and it still feeds the systems you already run, including Xero and MYOB.",
      ],
    },
  ],
  problemsHeading: 'Warning signs in the quoting process',
  problems: [
    'Quotes take too long to produce',
    'Pricing differs between staff for similar jobs',
    'Margins are not consistently applied',
    'Quote templates are manually edited and drift over time',
    'Calculations depend on one experienced estimator',
    'Errors are found after the quote is sent',
  ],
  capabilitiesHeading: 'What a quoting system can include',
  capabilities: [
    'Construction and trade estimating',
    'Manufacturing estimates and bill-of-material calculations',
    'Labour and material pricing libraries',
    'Margin and markup controls',
    'Optional items and variations',
    'Proposal and PDF quotation generation',
    'Approval workflows',
    'CRM integration',
    'Historical estimate analysis',
  ],
  afterCapabilitiesSections: [
    {
      id: 'ten-pillars',
      heading: 'The ten pillars of an effective costing and quoting system',
      tone: 'muted',
      intro:
        'Start with the process, not the technology. A costing system is usually an accumulation of operational knowledge, pricing rules and workarounds built up over years. We start by understanding what you already have, keep what works, and fix the weaknesses that hold back accuracy, control or growth. These are the ten things we make a high-performing costing and quoting system do.',
      layers: QUOTING_PILLARS.map((pillar) => ({
        title: pillar.title,
        description: pillar.description,
      })),
    },
  ],
  leadMagnet: {
    id: 'ten-pillars-guide',
    heading: 'Free guide: The Ten Pillars of Effective Costing & Quoting',
    body: 'A practical guide to high-performing costing systems — in Excel or as a connected web app. It sets out each of the ten pillars in detail, with the questions to ask of your own quoting process.',
    ctaLabel: 'Download the free guide',
    emailHint:
      'Enter your name, company and email and we will send the PDF.',
  },
  useCasesHeading: 'Example applications',
  useCases: [
    {
      title: 'Construction and fabrication estimating',
      description:
        'Component lists, labour, materials and waste logic structured so estimators produce consistent quotations.',
    },
    {
      title: 'Service and trade pricing',
      description:
        'Rate cards, packages and optional extras with controlled margins and clear customer-facing output.',
    },
    {
      title: 'Manufacturing quotations',
      description:
        'Bill-of-material driven estimates with material and process costs that update when inputs change.',
    },
    {
      title: 'Proposal generation with approvals',
      description:
        'Generate branded PDFs and route higher-value quotes through an approval step before they leave the business.',
    },
  ],
  afterUseCasesSections: [
    {
      id: 'industries-and-trades',
      heading: 'Industries and trades we build quoting systems for',
      tone: 'white',
      intro:
        "The right quoting system depends on how your trade prices work. We've built estimating and quoting tools for:",
      items: [
        'Construction and building — take-off-driven estimates, subcontractor pricing, variations.',
        'Structural steel and fabrication — cutting-stock optimisation and material-waste control.',
        'Engineering and machining — process-based costing and quote-to-drawing workflows.',
        'Manufacturing — bill-of-material estimates that update with input costs.',
        'Electrical and mechanical services — rate cards, packages and labour-hour pricing.',
        'Joinery and cabinetry — material, hardware and labour build-ups per unit.',
        'Professional and field services — packaged pricing with optional extras and controlled margins.',
      ],
    },
  ],
  technologyHeading: 'Excel, a connected web app, or both',
  technologyAlign: 'left',
  technologyNotes: [
    "Low-volume, specialist estimating often works best as a custom Excel quoting tool: fast to build, low cost, works offline, and able to hold pricing logic that would be awkward to force into a SaaS product. It's frequently the right first step.",
    'A browser-based application can complement Excel, replace selected parts of the process, or become the primary system — the right choice when several people quote at once, approvals matter, or quotes need to sync to a CRM, Xero or a customer portal.',
    "The economics of custom development have changed. AI-assisted programming tools let us deliver more functionality in less time, making some solutions viable that were previously dismissed as too expensive to build. Many projects start as a structured Excel estimator, then we migrate the same pricing logic into a web application once volume or team size makes it worthwhile — so you're never rebuilding from scratch.",
  ],
  technologies: [
    'Microsoft Excel',
    'VBA',
    'Microsoft 365',
    'Custom web apps',
    'APIs / CRM integration',
    'PDF generation',
    'SQL databases',
  ],
  processHeading: 'How we deliver quoting systems',
  processSteps: [
    {
      title: 'Understand the current process',
      description:
        'We map how work actually happens today — who uses the system, where data comes from, and what slows the team down.',
    },
    {
      title: 'Identify the right level of modernisation',
      description:
        'Not every process needs a full rebuild. We recommend the simplest approach that solves the business problem reliably.',
    },
    {
      title: 'Build and test the solution',
      description:
        'We deliver working software early, refine it with real users, and validate edge cases before go-live.',
    },
    {
      title: 'Support implementation and ongoing improvement',
      description:
        'Training, documentation and a clear path for enhancements so the system keeps matching how you work.',
    },
  ],
  faqs: [
    {
      question: 'Can you start with Excel and move to a cloud platform later?',
      answer:
        'Yes. Many quoting projects begin as a structured Excel estimator. When concurrent users, CRM sync or customer portals become important, we migrate the logic into a cloud application.',
    },
    {
      question: 'Can margins be locked down?',
      answer:
        'Yes. We can enforce minimum margins, role-based overrides and approval rules so commercial policy is applied consistently.',
    },
    {
      question: 'Can quotes sync to our CRM?',
      answer:
        'Where your CRM supports it, we can create or update opportunities, attach quote documents and keep status aligned.',
    },
    {
      question: 'Do you handle construction and manufacturing estimating?',
      answer:
        'Yes. We have delivered quoting tools for fabrication, construction-related work and manufacturing bill-of-material scenarios, as well as service pricing.',
    },
    {
      question: 'Can historical quotes inform new estimates?',
      answer:
        'When past quotes are stored in a structured way, we can surface comparable jobs and pricing patterns to support estimators.',
    },
    {
      question: 'How much does a custom quoting system cost?',
      answer:
        'Most projects are fixed-price once we\'ve scoped them. A focused Excel estimator is a smaller piece of work than a multi-user web application with approvals and CRM sync. We quote after we understand the process, so you know the price before we start.',
    },
    {
      question: 'How long does it take to build?',
      answer:
        'Timeframes depend on whether we are building a focused Excel estimator or a multi-user web application. We deliver a working version early and refine it with your team rather than disappearing for months.',
    },
    {
      question:
        'Do we have to replace our accounting or job-management software?',
      answer:
        'No. The quoting system sits alongside what you already use and feeds it — including Xero and MYOB. It replaces the estimating, not your whole stack.',
    },
    {
      question:
        'We already have quoting software that doesn\'t quite fit — can you extend it instead of replacing it?',
      answer:
        'Often, yes. Where your existing tool exposes an API or export, we can build around it rather than starting over.',
    },
    {
      question:
        'Can it handle unusual pricing logic — cutting stock, bill-of-materials, tiered rates?',
      answer:
        'Yes. That\'s usually why businesses come to us — the pricing logic is the part off-the-shelf tools can\'t do.',
    },
    {
      question: 'Is our pricing data kept confidential?',
      answer:
        'Yes. Your rates, margins and customer data stay yours, treated as confidential throughout.',
    },
  ],
  relatedSlugs: [
    'manufacturing-costing-estimating-quoting',
    'workflow-automation-systems-integration',
    'client-staff-portals',
  ],
  relatedLinkLabels: {
    'manufacturing-costing-estimating-quoting':
      'Manufacturing costing, estimating and quoting systems',
    'workflow-automation-systems-integration':
      'Automate quote approvals and CRM updates',
    'client-staff-portals': 'Let clients review proposals online',
  },
  caseStudies: [
    {
      slug: 'quoting-cutting-stock-kings',
      title: 'Project Quoting & Cutting Stock Tool',
      client: 'Kings Engineering',
      sector: 'Engineering & Construction',
      summary:
        'Excel quoting tool with cutting-stock optimisation — faster quotes, less material waste and stronger protection against underquoting.',
      published: true,
    },
  ],
  ctaHeading: 'Tell us how you quote today',
  ctaBody:
    'Describe the quote types you produce, who prepares them, and where errors or delays occur. We will recommend the right level of estimating system.',
  contactOptionLabel: 'Quoting & Estimating Systems',
} satisfies SolutionPage
