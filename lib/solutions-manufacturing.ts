import type { SolutionPage } from './solutions'

export const MANUFACTURING_DASHBOARD_ARTICLE_HREF =
  '/blog/production-manufacturing-dashboard-in-excel-get-expert-help-to-build-your-kpi-tracker'

export const manufacturingCostingSolution = {
  slug: 'manufacturing-costing-estimating-quoting',
  href: '/solutions/manufacturing-costing-estimating-quoting',
  title: 'Manufacturing Costing & Quoting Systems',
  shortTitle: 'Manufacturing costing',
  navLabel: 'Manufacturing Costing & Quoting Systems',
  summary:
    'Custom estimating and pricing systems for manufacturers, engineers and fabricators. Control materials, labour, machine time, waste, supplier prices and job margin.',
  exampleUses: [
    'Manufacturing costing',
    'Engineering & fabrication estimating',
    'Supplier price integration',
    'Quote-to-job profitability',
  ],
  icon: 'manufacturing',
  metaTitle: 'Manufacturing Costing & Quoting Systems NZ',
  metaDescription:
    'Custom manufacturing costing, estimating and quoting systems for New Zealand manufacturers, engineers and fabricators. Materials, labour, machine time, waste, margins, supplier pricing and job profitability — in Excel or custom software.',
  heroHeading: 'Manufacturing Costing, Estimating & Quoting Systems',
  heroSubheading:
    'Turn complex manufacturing costs into faster, more reliable quotes',
  heroIntroduction:
    'XLS Experts builds custom costing, estimating and quoting systems for manufacturers, engineering businesses and fabricators where pricing cannot be reduced to a simple price list. Materials, labour, machine time, subcontract work, setup, waste and overheads can all affect the true cost of producing a job. We bring those variables together into a structured commercial system — from sophisticated Excel estimators through to database-backed web applications integrated with your existing business software.',
  introHeading: 'Built for make-to-order and complex pricing environments',
  introBody: [
    'Generic quoting software works when pricing is straightforward. XLS Experts builds custom costing and quoting systems when the price depends on the way the product is actually manufactured.',
    'We are not primarily selling a generic quoting package. We model the commercial logic of the business — raw material consumption, components, bills of materials, labour, machine time, setup, production processes, subcontracting, waste, yield, overhead recovery, supplier prices, customer-specific pricing, markup, gross margin and quote revisions — so estimators can price a job the way the factory actually makes it.',
    'This is particularly relevant for manufacturers, engineering businesses, steel and metal fabricators, boat builders, joinery and specialist building-product manufacturers, electrical assembly and control-panel businesses, and other make-to-order or configured-product companies where every quote or job is slightly different.',
  ],
  introItems: [
    'Every job is different',
    'Products are configurable',
    'Material prices fluctuate',
    'Several production processes contribute to cost',
    'Labour content changes by product or specification',
    'Setup costs vary by production run',
    'Waste can materially affect profitability',
    'Customer pricing rules differ',
    'Experienced estimators currently carry significant knowledge in their heads',
    'Excel spreadsheets have evolved organically over many years',
  ],
  problemsHeading: 'Common manufacturing costing problems we solve',
  problems: [
    'Quotes taking too long to prepare',
    'Different estimators producing different prices for similar jobs',
    'Supplier pricing maintained manually across multiple spreadsheets',
    'Material price changes not reaching estimates quickly enough',
    'Labour allowances based on memory rather than controlled rates',
    'Machine or production time being inconsistently recovered',
    'Waste and yield assumptions varying between estimators',
    'Markup being confused with gross margin',
    'Important costs being added manually at the end of a quote',
    'Historical estimates being difficult to retrieve',
    'Quotes depending heavily on one experienced staff member',
    'Actual job profitability being difficult to compare with the original estimate',
  ],
  capabilitiesHeading: 'What a manufacturing costing system can include',
  capabilities: [
    'Raw materials and component pricing',
    'Bill of materials and component costing',
    'Supplier price management',
    'Labour rates by task, trade or process',
    'Machine and process time',
    'Setup costs versus per-unit production costs',
    'Waste, yield and material utilisation',
    'Subcontract processes',
    'Overhead allocation',
    'Customer-specific pricing and margin controls',
  ],
  useCasesHeading: 'Example applications',
  useCases: [
    {
      title: 'Engineering and steel fabrication estimating',
      description:
        'Material profiles, dimensions, weights, cutting requirements, labour and process costs combined into a controlled estimate, with utilisation and waste as part of the commercial model.',
    },
    {
      title: 'Custom manufacturing and boat-building pricing',
      description:
        'Configurable products, options and commercial rules used to determine expected cost and selling price as the estimator builds the required product.',
    },
    {
      title: 'Production-floor tracking',
      description:
        'Operational systems that record manufacturing activity so actual results can be understood alongside the original estimate.',
    },
    {
      title: 'Assembly tracking',
      description:
        'Production-stage, work-in-progress and throughput tracking for assembly businesses.',
    },
    {
      title: 'Construction-related manufacturing and engineering',
      description:
        'Estimating that combines purchased products, fabricated components, labour, installation, subcontract work and project-specific variables.',
    },
  ],
  technologyHeading: 'Excel where it works — custom software when it needs to grow',
  technologyNotes: [
    'The correct architecture depends on the business. We use the simplest architecture that solves the business problem properly.',
    'Excel remains the right platform when calculations are complex, user numbers are low and flexibility matters. We move beyond Excel when scale, workflow or multi-user requirements justify it.',
  ],
  technologies: [
    'Microsoft Excel',
    'VBA',
    'Power Query',
    'SQL databases',
    'Microsoft 365',
    'APIs',
    'Custom web applications',
    'ERP integrations',
    'Accounting integrations',
    'CRM integrations',
  ],
  preferDeepLayout: true,
  skipUseCaseGrid: true,
  skipProcessSteps: true,
  deepSections: [
    {
      id: 'when-pricing-outgrows-a-template',
      heading:
        'When manufacturing pricing becomes too complex for a spreadsheet template',
      intro:
        'Many manufacturing and engineering businesses develop their estimating process organically. A spreadsheet begins with material prices and labour hours. Over time it acquires additional worksheets, lookup tables, special customer rules, manually maintained supplier prices, waste allowances, overhead calculations and exceptions that only an experienced estimator fully understands.',
      body: [
        'Eventually the problem is no longer simply producing a quote. The business needs to know: what will this job genuinely cost us? Have current material prices been used? Has labour and machine time been allowed for correctly? Is waste properly accounted for? Are subcontract processes included? What margin will the job actually deliver? Can another estimator reproduce the same price? How does the quoted cost compare with what the job ultimately cost to manufacture?',
      ],
      callout: 'We build systems around those questions.',
    },
    {
      id: 'common-manufacturing-costing-problems',
      heading: 'Common manufacturing costing problems we solve',
      intro:
        'These are the patterns we see when manufacturing estimating has grown faster than the system behind it.',
      items: [
        'Quotes taking too long to prepare',
        'Different estimators producing different prices for similar jobs',
        'Supplier pricing maintained manually across multiple spreadsheets',
        'Material price changes not reaching estimates quickly enough',
        'Labour allowances based on memory rather than controlled rates',
        'Machine or production time being inconsistently recovered',
        'Waste and yield assumptions varying between estimators',
        'Markup being confused with gross margin',
        'Important costs being added manually at the end of a quote',
        'Historical estimates being difficult to retrieve',
        'Quotes depending heavily on one experienced staff member',
        'Actual job profitability being difficult to compare with the original estimate',
      ],
      callout:
        'The objective is not simply to automate a spreadsheet. It is to capture the commercial logic of the business in a system that can be understood, maintained and applied consistently.',
    },
    {
      id: 'estimate-quote-profitability',
      heading: 'Estimate accurately. Quote consistently. Measure profitability.',
      intro:
        'A useful manufacturing costing system is not only a quoting tool. It supports three connected commercial stages.',
      cardColumns: 3,
      cards: [
        {
          title: '1. Estimate accurately',
          description: 'Capture the real cost drivers:',
          items: [
            'Materials',
            'Components',
            'Labour',
            'Machine time',
            'Setup',
            'Processes',
            'Subcontracting',
            'Waste',
            'Overhead',
          ],
        },
        {
          title: '2. Quote consistently',
          description: 'Apply controlled commercial rules:',
          items: [
            'Margin rules',
            'Customer pricing',
            'Quote revisions',
            'Approval thresholds',
            'Standard commercial logic',
            'Quotation presentation',
          ],
        },
        {
          title: '3. Measure profitability',
          description: 'Compare the estimate with what actually happened:',
          items: [
            'Estimated cost',
            'Actual production cost',
            'Quoted price',
            'Actual invoice value',
            'Expected margin',
            'Realised margin',
          ],
        },
      ],
    },
    {
      id: 'what-a-manufacturing-costing-system-can-include',
      heading: 'What a manufacturing costing system can include',
      intro:
        'The right system captures the manufacturer’s pricing logic rather than forcing the business into a predefined model. What follows is typical of the commercial building blocks we assemble — not a fixed product checklist.',
      cards: [
        {
          title: 'Raw materials and components',
          description:
            'Maintain structured pricing for steel, timber, sheet materials, components, consumables or purchased assemblies. Costs may be based on units, length, area, weight, volume, packs or other industry-specific measures.',
        },
        {
          title: 'Bill of materials and component costing',
          description:
            'Where products are assembled from multiple parts, costs can be calculated from structured components or bills of materials. The structure can range from a relatively simple product recipe through to assemblies and configurable product options where the commercial requirement justifies it. This is not a claim of full MRP capability.',
        },
        {
          title: 'Supplier price management',
          description:
            'Support controlled supplier-price imports rather than manually updating individual spreadsheets.',
          items: [
            'Multiple suppliers',
            'Supplier SKUs',
            'Pack quantities',
            'Currency',
            'Quantity breaks',
            'Effective dates',
            'Preferred supplier',
            'Price history',
          ],
        },
        {
          title: 'Labour rates',
          description:
            'Apply controlled labour rates by task, trade, department, process or skill level. Systems can distinguish internal labour cost, charge-out rates and recovered production rate where the business needs that separation.',
        },
        {
          title: 'Machine and process time',
          description:
            'Cost manufacturing operations beyond labour alone — CNC time, cutting, welding, finishing, painting, machining, programming, production-line time and equipment usage.',
        },
        {
          title: 'Setup costs',
          description:
            'Separate one-off setup or preparation costs from per-unit production costs. That distinction matters particularly when comparing small and large production runs, because setup can dominate the unit cost of a short run and almost disappear on a long one.',
        },
        {
          title: 'Waste and yield',
          description:
            'Model realistic material utilisation. This can range from percentage waste allowances through to more specialised cutting logic, nesting assumptions, usable lengths, sheet utilisation, yield calculations and material optimisation.',
        },
        {
          title: 'Subcontract processes',
          description:
            'Include external processes such as powder coating, galvanising, heat treatment, specialist machining, finishing, transport and outsourced fabrication.',
        },
        {
          title: 'Overhead allocation',
          description:
            'Recover overhead based on appropriate commercial drivers such as labour hours, machine hours, job value, production quantities, fixed job charges, department or other business-specific allocation rules.',
        },
        {
          title: 'Customer-specific pricing',
          description:
            'Support negotiated discounts, customer price structures, contract rates, minimum margins, volume-based pricing and special commercial agreements — controlled centrally rather than maintained in individual copies of spreadsheets.',
        },
        {
          title: 'Margin and markup controls',
          description:
            'Markup and gross margin are not the same thing. Markup is the amount added to cost; gross margin is that amount expressed as a percentage of selling price. Systems can calculate expected margin and apply minimum-margin warnings, approval thresholds, user permissions and management overrides.',
        },
      ],
    },
    {
      id: 'from-estimate-to-customer-quote',
      heading: 'From estimate to customer quote',
      intro:
        'The costing engine can feed the quoting workflow directly. The estimator should not need to calculate the job in one system and manually recreate the commercial proposal in another.',
      body: [
        'This is where manufacturing costing connects to our broader [custom quoting and estimating systems](/solutions/quoting-estimating-systems): the same commercial logic that produces the cost also produces the customer-facing quotation.',
      ],
      items: [
        'Quote numbering',
        'Customer selection',
        'Product or job configuration',
        'Optional items',
        'Quantity breaks',
        'Alternative specifications',
        'Quote revisions',
        'Margin approval',
        'Sales notes',
        'Branded quotation documents',
        'PDF generation',
        'Quote history',
        'Quote expiry',
        'Acceptance status',
        'CRM integration',
        'Quote-to-job handoff',
        'Sales-order creation',
      ],
    },
    {
      id: 'quoted-cost-versus-actual-cost',
      heading: 'Quoted cost versus actual cost',
      intro:
        'The estimate becomes much more valuable when actual results are compared with the assumptions. Quoted cost versus actual cost is where a costing system turns from a quoting aid into a management tool.',
      body: [
        'If a particular product, estimator, process or type of work is consistently underquoted, management should be able to identify that pattern and adjust future pricing. That feedback loop is also where manufacturing costing meets [project costing tools](/solutions/project-costing-financial-modelling) and [production dashboards](/solutions/dashboards-business-intelligence).',
      ],
      cards: [
        {
          title: 'What the comparison can show',
          items: [
            'Estimated materials vs actual materials',
            'Estimated labour vs actual labour',
            'Estimated machine time vs actual machine time',
            'Expected subcontract costs vs actual subcontract costs',
            'Quoted selling price vs final invoice value',
            'Expected margin vs realised margin',
          ],
        },
        {
          title: 'Why the feedback loop matters',
          description:
            'An estimate that cannot be compared with actual manufacturing cost is difficult to improve. Retaining the original estimate as a baseline lets the business see whether pricing logic, rates or waste assumptions need to change.',
        },
      ],
    },
    {
      id: 'manufacturing-job-profitability',
      heading: 'Manufacturing job profitability',
      intro:
        'Structured estimate and actual-cost data can provide profitability analysis beyond a single quote. This is a management decision-making capability, not just a quoting tool.',
      body: [
        'Once estimates and actuals are stored in a consistent structure, profitability can be reviewed by customer, product, product family, job, job type, estimator, salesperson, material type, production process, business unit or factory/location.',
      ],
      items: [
        'Customer',
        'Product and product family',
        'Job and job type',
        'Estimator and salesperson',
        'Material type',
        'Production process',
        'Business unit',
        'Factory / location',
      ],
    },
    {
      id: 'example-applications',
      heading: 'Example applications',
      intro:
        'These examples are drawn from work we have actually done, together with neighbouring estimating experience in construction, electrical, engineering and specialist trades. The underlying commercial challenge is often the same: combine materials, labour, processing, waste, supplier costs and commercial margin into a repeatable pricing model.',
      cards: [
        {
          title: 'Engineering and steel fabrication estimating',
          description:
            'Material profiles, dimensions, weights, cutting requirements, labour and process costs can be combined into a controlled estimate. Where material utilisation matters, cutting and waste calculations can form part of the commercial model rather than relying on a simple percentage allowance. Small errors in material recovery can materially affect job margin.',
        },
        {
          title: 'Custom manufacturing and boat-building pricing',
          description:
            'Highly configurable products cannot always be handled through a fixed price list. We have built a custom pricing solution for a boat-building business where materials, components, labour, options and commercial rules are combined dynamically so the estimator builds the required product while the system calculates expected cost and selling price.',
        },
        {
          title: 'Production-floor tracking',
          description:
            'We have developed production tracking systems, including work for Bremworth Carpets that tracked manufacturing activity and individual carpet mills. That work was operational rather than a costing implementation, but it is relevant because it shows the relationship between estimating, production, operational data and actual results. [Production and manufacturing dashboards in Excel](/blog/production-manufacturing-dashboard-in-excel-get-expert-help-to-build-your-kpi-tracker) are often the reporting layer that sits on top of that operational data.',
        },
        {
          title: 'Assembly tracking',
          description:
            'We also developed a production and assembly tracking solution for a gift-box manufacturing business. That work is useful evidence of how production stages, work-in-progress, assembly workflow and throughput can be captured — without overstating it as a full manufacturing ERP.',
        },
        {
          title: 'Construction-related manufacturing and engineering',
          description:
            'Many engineering contractors, electrical businesses, fabricators and specialist building-product suppliers sit somewhere between project contracting and manufacturing. Their pricing may combine purchased products, fabricated components, labour, installation, subcontract work and project-specific variables. These are strong candidates for custom estimating systems.',
        },
      ],
    },
    {
      id: 'excel-where-it-works',
      heading: 'Excel where it works — custom software when it needs to grow',
      intro:
        'Not every project needs a web application. One of the XLS Experts differentiators is the ability to use Excel when Excel is genuinely the right platform, then move through [Excel VBA development](/excel-vba-macro-development) and database-backed or [custom web applications](/web-applications) when scale, workflow or multi-user requirements justify it.',
      callout:
        'We use the simplest architecture that solves the business problem properly.',
      layers: [
        {
          title: 'Excel',
          description:
            'Suitable where calculations are complex, user numbers are low, flexibility is important, and Excel is already central to the business process.',
        },
        {
          title: 'Excel + VBA',
          description:
            'Suitable where workflow needs automation, users need controlled interfaces, quotations need automated output, or business rules need stronger enforcement.',
        },
        {
          title: 'Database-backed application',
          description:
            'Suitable where data must be centralised, multiple users need simultaneous access, price lists and estimates need structured history, or permissions matter.',
        },
        {
          title: 'Custom web application',
          description:
            'Suitable where users work across locations, mobile or browser access is required, workflow spans departments, or integration becomes important.',
        },
        {
          title: 'Integrated system',
          description:
            'Suitable where information needs to move between ERP, inventory, accounting, CRM, production and estimating.',
        },
      ],
    },
    {
      id: 'integration-with-existing-systems',
      heading: 'Integration with existing business systems',
      intro:
        'Manufacturing pricing rarely operates in isolation. We are not positioning this work as a replacement for every function in an ERP or MRP system.',
      body: [
        'Where an existing ERP already handles inventory, purchasing, customers, sales orders, production records or accounting, those systems can stay in place. The custom application manages specialist estimating logic that the ERP cannot model effectively. Once approved, quote or job information may then be passed back into the existing business workflow.',
        'That is the same practical approach we take with [workflow automation](/solutions/workflow-automation-systems-integration): fill the gap rather than replace systems that already work.',
        'An ERP may remain the master system for products, customers, inventory and purchasing, while XLS Experts builds the costing, quoting or workflow layer around it. Potential integrations include ERP systems, accounting systems, CRM, inventory, supplier databases, product databases, production systems, Microsoft 365 and existing Excel workbooks.',
      ],
      callout: 'Fill the gap rather than replace systems that already work.',
    },
    {
      id: 'how-we-approach-manufacturing-costing',
      heading: 'We start with the way you actually calculate a job',
      intro:
        'The work begins with experienced estimators, not with a software template.',
      layers: [
        {
          title: 'Understand the commercial model',
          description:
            'Work through how experienced estimators currently determine a price: materials, processes, labour, waste, overheads, subcontracting, margin and exceptions.',
        },
        {
          title: 'Identify the pricing logic',
          description:
            'Separate repeatable commercial rules, data inputs, estimator judgement and exceptions. Identify information sources such as existing spreadsheets, supplier files, ERP, historical quotes, product databases and experienced staff.',
        },
        {
          title: 'Build the costing engine',
          description:
            'Develop the working model and validate it against real historic and current jobs. The important test is not whether the software calculates something. It is whether it calculates the commercial answer your experienced people trust.',
        },
        {
          title: 'Add workflow and integration',
          description:
            'Once the costing engine is reliable, add where useful: quote generation, approvals, CRM, ERP handoff, dashboards, permissions and document automation.',
        },
        {
          title: 'Compare estimates with reality',
          description:
            'Where actual production or financial data exists, compare expected and actual job performance. This creates the profitability feedback loop.',
        },
      ],
      callout:
        'The important test is not whether the software calculates something. It is whether it calculates the commercial answer your experienced people trust.',
    },
  ],
  whyUs: {
    heading:
      'Practical manufacturing experience without forcing an MRP system',
    body: [
      'XLS Experts does not approach these projects as a vendor of a generic manufacturing package. Our experience comes from building custom commercial and operational systems around real business processes — including engineering and fabrication estimating, material optimisation, configurable product pricing and production-floor tracking.',
      'We have built quoting and estimating solutions for engineering and steel fabrication businesses involving material dimensions, steel profiles, material weight, cutting requirements, material utilisation, waste reduction, labour, job pricing and protection against underquoting. We have built a custom pricing solution for a boat-building business. We previously built an operational manufacturing solution for Bremworth Carpets that tracked production-floor activity and individual carpet mills. We also developed a production and assembly tracking solution for a gift-box business.',
      'A significant amount of our estimating, costing and pricing experience has also come from construction, electrical, engineering and specialist trades. That neighbouring experience is highly relevant to manufacturing costing because the commercial problem is often the same.',
      'Some clients need a sophisticated Excel costing model. Others need a shared quoting application. Others may need product, supplier, production and commercial information connected across several systems. We build only as much system as the business problem requires.',
    ],
  },
  processHeading: 'We start with the way you actually calculate a job',
  processSteps: [
    {
      title: 'Understand the commercial model',
      description:
        'Work through how experienced estimators currently determine a price: materials, processes, labour, waste, overheads, subcontracting, margin and exceptions.',
    },
    {
      title: 'Identify the pricing logic',
      description:
        'Separate repeatable commercial rules, data inputs, estimator judgement and exceptions, and identify the information sources behind them.',
    },
    {
      title: 'Build the costing engine',
      description:
        'Develop the working model and validate it against real historic and current jobs — so it calculates the commercial answer experienced people trust.',
    },
    {
      title: 'Add workflow and integration',
      description:
        'Once the costing engine is reliable, add quote generation, approvals, CRM, ERP handoff, dashboards, permissions and document automation where useful.',
    },
    {
      title: 'Compare estimates with reality',
      description:
        'Where actual production or financial data exists, compare expected and actual job performance to create the profitability feedback loop.',
    },
  ],
  faqs: [
    {
      question: 'What is a manufacturing costing system?',
      answer:
        'A manufacturing costing system calculates the expected cost of producing a product or job by bringing together materials, components, labour, machine time, setup, subcontract work, waste, overhead and other relevant cost drivers. It can also apply pricing and margin rules to produce a controlled selling price or quotation.',
    },
    {
      question: 'Can Excel be used for manufacturing costing?',
      answer:
        'Yes. Excel can be an excellent platform for complex manufacturing calculations, particularly for specialist estimators and smaller teams. When requirements expand to multiple simultaneous users, centralised data, permissions or wider workflow, the same costing logic can be moved into a database-backed or web application.',
    },
    {
      question: 'Can you improve our existing manufacturing costing spreadsheet?',
      answer:
        'Yes. Many projects begin with an existing workbook that already contains valuable commercial knowledge. Where the underlying logic is sound, we can restructure, automate and extend it instead of replacing it unnecessarily.',
    },
    {
      question: 'What is BOM costing?',
      answer:
        'Bill-of-material costing calculates product cost from the individual components, materials or assemblies required to manufacture it. Depending on the business, the structure may range from a simple component list to configurable assemblies and product options.',
    },
    {
      question: 'Can supplier price lists be imported automatically?',
      answer:
        'Usually, yes. Structured Excel, CSV or other supplier files can often be imported through a controlled update process. Where suppliers or existing systems provide APIs, more direct integration may also be possible.',
    },
    {
      question: 'Can a manufacturing costing system include material waste?',
      answer:
        'Yes. Waste can be handled through percentage allowances or more specialised rules based on material dimensions, cutting requirements, yield and actual utilisation.',
    },
    {
      question: 'Can the system calculate labour and machine costs?',
      answer:
        'Yes. Labour can be costed by task, trade, department or process, while machine time, setup time and production processes can be allocated using appropriate rates.',
    },
    {
      question: 'Can we control minimum gross margin?',
      answer:
        'Yes. A system can calculate expected gross margin and apply warnings, approval rules or permissions when a quote falls below required commercial thresholds.',
    },
    {
      question: 'Can it compare quoted cost with actual manufacturing cost?',
      answer:
        'Yes, where suitable production and actual-cost data is available. The original estimate can be retained as a baseline and compared with actual material, labour, subcontract and other costs.',
    },
    {
      question: 'Can manufacturing costing software integrate with an ERP?',
      answer:
        'Potentially, yes. Where the ERP provides suitable APIs, database access or import/export functionality, the custom costing application can exchange information with it rather than duplicating data unnecessarily.',
    },
    {
      question: 'Do you provide complete MRP or manufacturing ERP software?',
      answer:
        'Our focus is custom costing, estimating, pricing, workflow and operational applications rather than supplying a generic MRP or ERP package. Where an existing ERP already manages inventory, purchasing or production effectively, we generally prefer to integrate with it and build the specialist commercial functionality around it.',
    },
    {
      question: 'Can a costing system create customer quotations?',
      answer:
        'Yes. The same costing engine can feed quotation generation, revision management, PDF output, margin approval and quote-to-job or quote-to-sales-order processes.',
    },
    {
      question: 'Can the software support engineering and fabrication businesses?',
      answer:
        'Yes. Engineering and fabrication businesses are particularly good candidates because pricing commonly combines materials, cutting or utilisation, labour, processing, subcontract work and margin rules.',
    },
    {
      question: 'Can A.I. replace the costing engine?',
      answer:
        'No. A.I. can assist with activities such as reading supplier documents, extracting enquiry information, interpreting specifications and categorising data, but the costing engine itself should remain a controlled commercial model. See our [A.I. workflow automation](/ai-workflow-and-business-process-automation) work for where those supporting activities fit.',
    },
  ],
  relatedSlugs: [
    'quoting-estimating-systems',
    'project-costing-financial-modelling',
    'dashboards-business-intelligence',
    'resource-planning-scheduling',
    'workflow-automation-systems-integration',
  ],
  relatedLinkLabels: {
    'quoting-estimating-systems':
      'Broader quoting platforms, estimate generation, pricing workflow and approvals',
    'project-costing-financial-modelling':
      'Commercial modelling, project economics and planned-versus-actual analysis',
    'dashboards-business-intelligence':
      'Production, cost, margin and profitability reporting',
    'resource-planning-scheduling':
      'Labour, capacity and production scheduling',
    'workflow-automation-systems-integration':
      'Connect estimating with ERP, CRM, accounting and production systems',
  },
  relatedExtras: [
    {
      href: '/ai-workflow-and-business-process-automation',
      title: 'A.I. Workflow Automation',
      label:
        'Assist with supplier documents, enquiry extraction and specification interpretation — without replacing the costing engine',
    },
  ],
  relatedReading: [
    {
      href: MANUFACTURING_DASHBOARD_ARTICLE_HREF,
      title: 'Production & Manufacturing Dashboard in Excel',
      description:
        'Production reporting tells you what is happening on the factory floor. If you also need to control how jobs are priced before production begins, this costing and quoting page is the commercial counterpart to that operational view.',
    },
  ],
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
  ctaHeading: 'Show us how you currently price a job',
  ctaBody:
    'If your current estimating process depends on a complex spreadsheet, manual supplier lookups, one experienced estimator or commercial rules that generic quoting software cannot reproduce, show us how it works. We can help turn that knowledge into a structured manufacturing costing and quoting system that is faster to use, easier to maintain and gives you much stronger control over margin and job profitability.',
  ctaButtonLabel: 'Discuss Your Manufacturing Costing Project',
  primaryCtaLabel: 'Discuss your manufacturing costing process',
  secondaryCtaLabel: 'Explore related solutions',
  contactOptionLabel: 'Manufacturing Costing & Quoting Systems',
} satisfies SolutionPage
