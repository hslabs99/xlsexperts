# Cursor Spec — Industries Section (xlsexperts.com / .co.uk / .co.nz)

## 0. Summary for Cursor

Add a third content group, **Industries**, next to the existing **Services** and **Solutions** groups. It must reuse the same frontend templates, CMS backend, and **regionalisation behaviour** (per-region field overrides for .com / .co.uk / .co.nz) that Services and Solutions already use. Do not build a parallel system — extend the existing content model, route and region config.

Seed 10 industry pages (content in section 6). All 10 publish on all three regional sites. Body copy has a shared base, and region-overridable fields supply the regional differences.

Before writing code, inspect how Services and Solutions are modelled (types, CMS collections, region resolver, sitemap, nav, metadata, JSON-LD), then mirror that pattern exactly.

---

## 1. Routes

| Route | Purpose |
|---|---|
| `/industries` | Industries index (hub) – grid of all industry cards |
| `/industries/[slug]` | Individual industry page |

- Use `generateStaticParams` over all published industry slugs.
- Unknown slug → `notFound()` (true 404, **not** a 200 fallback to the blog index – see section 9).
- Same slugs on all three domains. Hreflang alternates: `en-US` → .com, `en-GB` → .co.uk, `en-NZ` → .co.nz, `x-default` → .com (match existing pattern).
- Self-referencing canonical per region.

---

## 2. Data model (extend existing CMS)

Create an `industry` collection/type that mirrors the Service/Solution shape. Fields marked **(R)** support per-region override through the existing region resolver: base value, with an optional `us` / `uk` / `nz` override that falls back to base.

```ts
type Industry = {
  slug: string;                       // e.g. "engineering-energy-utilities"
  name: string;                       // "Engineering, Energy & Utilities"
  navLabel: string;                   // short label for menus, e.g. "Engineering & Energy"
  order: number;                      // nav/index ordering
  icon?: string;                      // reuse existing icon set (lucide)
  heroImage?: string;                 // optional, same pipeline as services

  // SEO (R)
  seoTitle: Regional<string>;         // <title> without " | XLS Experts" suffix (suffix appended once by layout – do NOT double it)
  metaDescription: Regional<string>;  // 140–160 chars
  primaryKeywords: Regional<string[]>;// for internal reference + used in H1/H2/FAQ copy, NOT rendered as a keyword list
  h1: Regional<string>;

  // Body (R where marked)
  introLead: Regional<string>;        // 1–2 sentence lead under H1
  intro: Regional<string>;            // 2 short paragraphs (markdown)
  challenges: { title: string; body: string }[];          // 5 items (base)
  solutions: { title: string; body: string; link: string }[]; // 5 items, each links to an existing service/solution route
  aiSection: { heading: string; intro: string; bullets: string[] };
  toolsWeConnect: Regional<string[]>;  // region-specific systems (e.g. Xero/MYOB vs QuickBooks/NetSuite vs Sage)
  complianceNote?: Regional<string>;  // optional one-liner on regional regulation/reporting context
  proofLine: Regional<string>;        // regional credibility line (see section 5)
  faqs: Regional<{ q: string; a: string }[]>; // 4 items; base + optional region overrides
  relatedServices: string[];          // existing service slugs
  relatedSolutions: string[];         // existing solution slugs
  caseStudySectors: string[];         // match against existing case-study `sector` field(s)
  ctaHeading: Regional<string>;
  published: boolean;
};
```

**Spelling:** base copy below uses UK/NZ spelling. For the **.com** region, render US spelling (organization, optimize, modeling, analyze, etc.) – use the existing region spelling mechanism if one exists; if not, create the US variants as `us` overrides for every (R) text field when seeding. Keep "modelling" on .co.uk/.co.nz.

---

## 3. Page template – `/industries/[slug]`

Reuse the Services/Solutions page shell (header, footer, typography, section components, contact form, CTA styles). Section order:

1. **Hero** – H1 (regional), introLead, primary CTA "Book a free discovery call" (existing CTA component), secondary CTA "See case studies" (anchor to section 7).
2. **Intro** – 2 paragraphs (regional).
3. **"Challenges we see in {industry}"** – H2 + 5 cards (challenges).
4. **"How we help"** – H2 + 5 solution cards, each a real `<Link>` to its service/solution page.
5. **"Where AI fits"** – H2 + intro + bullets (aiSection).
6. **"Systems we connect"** – chip list from `toolsWeConnect` (regional) + optional `complianceNote`.
7. **"Relevant work"** – case-study cards pulled from existing case-study data where `sector` ∈ `caseStudySectors`. Regional naming rule in section 5. If none match, hide the section (no empty state).
8. **Related services & solutions** – link list from `relatedServices` + `relatedSolutions`.
9. **FAQ** – accordion, 4 items (regional), with `FAQPage` JSON-LD.
10. **CTA band + enquiry form** – existing component; `ctaHeading` regional. Form must still route to `/thank-you` via the existing `markLeadConversionPending` → `router.push(buildThankYouPath(...))` flow so Ads/GA4 conversions keep working. Pass `form_name: "industry_<slug>"` if the form API supports a source field.

**JSON-LD:** `Service` (provider = existing Organization/ProfessionalService entity, `areaServed` = region country: US / GB / NZ, `audience` = BusinessAudience with industry name) + `FAQPage` + `BreadcrumbList` (Home › Industries › {name}).

---

## 4. Index page – `/industries`

- H1 (R): .com "Excel & Automation Solutions by Industry" / .co.uk same / .co.nz "Excel & Automation Solutions for NZ Industries".
- Intro (base): "We've built Excel, VBA, custom application and AI-assisted solutions for businesses in almost every sector. These pages show the problems we solve most often in each industry and the systems we build to fix them. Don't see your industry? The challenges are usually more similar than different. Talk to us."
- Grid of industry cards (icon, navLabel, introLead, "Explore →" link).
- Closing CTA + form.
- Meta title (R): "Excel Solutions by Industry US" / "… UK" / "… NZ". Meta description (base): "Excel automation, VBA, custom apps and AI workflows for finance, engineering, construction, manufacturing, hospitality and more. See how we help your industry."

---

## 5. Regional rules (confirmed by Mike)

- All 10 industries publish on all three domains.
- **Client names:** on **.co.nz**, case-study cards show client names (e.g. AMP, NZI, Pullman, OCS / 1M, Innovision Boats). On **.com and .co.uk**, show anonymised descriptors while still linking to the case study:
  - NZI → "A national insurer"
  - AMP Financial Services → "A national financial services provider"
  - Pullman Hotel → "An international hotel brand"
  - 1M / OCS Group → "A facilities management contractor"
  - Innovision Boats → "A custom boat builder"
  - Apartment Renovations → "A residential renovation company"
  - Implement as a regional `displayClient` override on the existing case-study data (base = real name; `us`/`uk` = descriptor) so the same rule applies everywhere case studies render.
- **proofLine (R):**
  - nz: "Trusted by New Zealand organisations from national insurers to specialist manufacturers."
  - us: "Delivered remotely for US and international teams, with overlap into US business hours."
  - uk: "Delivered remotely for UK and international teams, with overlap into UK business hours."
- Never show "NZ"-specific strings (GST, IRD, NZD, "Kiwi", NZ-only links like "Templates for NZ Manufacturers") on .com/.co.uk pages in this section.

---

## 6. Navigation & internal linking

1. **Main nav:** add "Industries" alongside Services and Solutions (same dropdown/mega-menu component). Dropdown lists the 10 navLabels + "All industries".
2. **Footer:** add an Industries column (same pattern as Services/Solutions columns).
3. **Service & Solution pages:** add an "Industries we do this for" chip row linking to the industries whose `relatedServices`/`relatedSolutions` include that page (compute the reverse lookup; no manual wiring).
4. **Case-study pages/cards:** add an industry tag linking to the matching industry page.
5. **Homepage:** add a compact "Industries" strip (icons + labels) under the existing services block.
6. **Sitemap:** add `/industries` and all `/industries/[slug]` to each region's sitemap (region host only, matching existing sitemap behaviour).

---

## 7. Seed content – 10 industries

Base copy is shared. Each region gets its own H1/title/meta/keywords/tools. Solution links use existing routes. Verify every link resolves; if a slug differs in the codebase, map it to the nearest existing route.

---

### 7.1 Finance & Accounting
- **slug:** `finance-accounting` · **navLabel:** Finance & Accounting · **order:** 1
- **caseStudySectors:** ["Financial Services"]
- **seoTitle:** us "Excel Automation for Finance & Accounting US" · uk "… UK" · nz "… NZ"
- **h1:** us "Excel automation & financial modeling for finance and accounting teams" · uk/nz "Excel automation & financial modelling for finance and accounting teams"
- **metaDescription (base):** "Automate month-end, reconciliations and management reporting. Custom Excel models, VBA workflows and AI-assisted checks for finance and accounting teams."
- **primaryKeywords:** us ["excel automation for accountants", "financial modeling consultant", "month end close automation excel", "excel consultant for finance teams"] · uk ["excel automation for accountants uk", "financial modelling consultant uk", "month end automation excel"] · nz ["excel consultant for accountants nz", "financial modelling nz", "month end reporting automation nz"]
- **introLead:** "Finance teams live in Excel. We make that time count: fewer manual steps, fewer errors, faster close."
- **intro:** "Most finance and accounting teams already have their ledger and payroll systems. The friction is everything around them: exports pasted into workbooks, reconciliations checked by eye, management packs rebuilt every month, and models only one person understands.\n\nWe build governed Excel models, VBA-driven workflows and lightweight custom applications that connect to your accounting system, automate the repeatable steps and keep the logic transparent and auditable. Where it adds value, we add AI-assisted checks that flag anomalies before they reach the report."
- **challenges:**
  1. Month-end close takes days – manual exports, copy-paste and rework every cycle.
  2. Reconciliations depend on visual checking and tribal knowledge.
  3. Management reports and board packs are rebuilt by hand each month.
  4. Fragile, undocumented models with broken links and hard-coded numbers.
  5. Budget and forecast versions scattered across emailed workbooks.
- **solutions:**
  1. Automated month-end reporting packs → `/excel-dashboard-development`
  2. Bank, ledger and intercompany reconciliation tools → `/excel-vba-macro-development`
  3. Budgeting, forecasting and scenario models → `/excel-financial-modelling`
  4. Live connections to your accounting system and databases → `/excel-integrations`
  5. Model reviews and spreadsheet risk audits → `/spreadsheet-auditing`
- **aiSection:** heading "Where AI fits in finance" · intro "AI works best here as a second set of eyes, not a black box." · bullets: "Flag unusual transactions and variances before sign-off"; "Draft variance commentary for management reports for a human to review"; "Extract invoice and statement data from PDFs into structured tables"
- **toolsWeConnect:** us ["QuickBooks", "NetSuite", "Sage Intacct", "Bill.com", "SQL Server", "Power BI"] · uk ["Xero", "Sage", "QuickBooks", "Dext", "SQL Server", "Power BI"] · nz ["Xero", "MYOB", "Dext", "SQL Server", "Power BI"]
- **complianceNote:** us "Built with audit trails and review steps that support SOX-style internal controls." · uk "Supports Making Tax Digital-ready workflows alongside your accounting software." · nz "Built around GST periods and IRD reporting cycles."
- **faqs (base):**
  - "Can you automate our month-end reporting without replacing our accounting system?" → "Yes. We connect Excel to your existing system, automate the data pull and build the report pack around it, so your ledger stays the source of truth."
  - "Do you fix existing financial models or only build new ones?" → "Both. Many projects start with a review of an existing model, then targeted fixes to structure, formulas and controls."
  - "How do you keep models auditable?" → "Clear input, calculation and output separation, documented logic, version control and check totals so reviewers can trace every number."
  - "Is AI safe to use with financial data?" → "We use AI for review and extraction tasks with human sign-off, and agree data-handling rules with you before anything is processed."
- **relatedServices:** ["excel-financial-modelling", "excel-dashboard-development", "excel-integrations", "spreadsheet-auditing", "power-query-consulting"]
- **relatedSolutions:** ["dashboards-business-intelligence", "project-costing-financial-modelling"]
- **ctaHeading (base):** "Shorten your close and trust your numbers"

---

### 7.2 Insurance
- **slug:** `insurance` · **navLabel:** Insurance · **order:** 2
- **caseStudySectors:** ["Insurance"]
- **seoTitle:** us "Excel & Data Automation for Insurance US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Claims, portfolio and pricing analysis tools for insurers and brokers"
- **metaDescription:** "Custom Excel and enterprise apps for claims analysis, portfolio reporting and pricing. Automate data prep and give underwriters and analysts faster answers."
- **primaryKeywords:** us ["insurance claims analysis tool", "excel for insurance analytics", "insurance reporting automation", "underwriting spreadsheet consultant"] · uk ["insurance claims analysis excel uk", "insurance reporting automation uk"] · nz ["insurance claims analysis nz", "insurance data reporting nz"]
- **introLead:** "Insurance runs on data, and most of it still passes through spreadsheets on its way to a decision."
- **intro:** "Claims extracts, bordereaux, loss runs and pricing workbooks all need cleaning, joining and analysing before anyone can act on them. When that work is manual, analysts spend their time preparing data instead of interpreting it.\n\nWe build enterprise-grade Excel applications and custom tools that automate data preparation, standardise claims and portfolio analysis, and give underwriters, claims managers and actuaries consistent, explainable outputs."
- **challenges:** "Claims and policy extracts arrive in inconsistent formats"; "Bordereaux and partner data need manual cleansing every cycle"; "Loss ratio and portfolio reports take days to compile"; "Pricing and rating workbooks are complex and hard to govern"; "Analysis logic lives in individual analysts' files"
- **solutions:** "Claims analysis applications" → `/enterprise`; "Automated bordereaux and data cleansing pipelines" → `/power-query-consulting`; "Portfolio and loss-ratio dashboards" → `/solutions/dashboards-business-intelligence`; "Governed rating and pricing workbooks" → `/excel-spreadsheet-development`; "Workflow automation between claims systems and reporting" → `/solutions/workflow-automation-systems-integration`
- **aiSection:** heading "Where AI fits in insurance" · intro "AI speeds up the reading and sorting so experts can focus on judgement." · bullets: "Classify claim notes and free-text descriptions into consistent categories"; "Extract key fields from emailed documents and PDFs"; "Highlight outlier claims for human review"
- **toolsWeConnect:** us ["Guidewire exports", "Duck Creek exports", "SQL Server", "Snowflake", "Power BI"] · uk ["Lloyd's bordereaux formats", "SQL Server", "Power BI", "Azure"] · nz ["Core policy system exports", "SQL Server", "Power BI", "Azure"]
- **faqs:** "Can you work with extracts from our core insurance system?" → "Yes. We build repeatable import and cleansing steps around the extracts you already get, so no core-system changes are needed."; "Will the tool handle large claims datasets?" → "We design for volume using Power Query, SQL or a web application where Excel alone would struggle."; "Can actuaries and analysts still see the logic?" → "Yes. Calculations stay transparent and documented, which matters for review and governance."; "Do you sign NDAs and follow data-handling policies?" → "Yes, as standard."
- **relatedServices:** ["enterprise", "power-query-consulting", "excel-dashboard-development", "web-applications"]
- **relatedSolutions:** ["dashboards-business-intelligence", "workflow-automation-systems-integration"]
- **ctaHeading:** "Turn claims data into decisions faster"

---

### 7.3 Engineering, Energy & Utilities
- **slug:** `engineering-energy-utilities` · **navLabel:** Engineering & Energy · **order:** 3
- **caseStudySectors:** ["Engineering", "Energy", "Utilities", "Infrastructure", "Facilities Management"]
- **seoTitle:** us "Excel & Data Automation for Engineering, Energy & Utilities US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Engineering data, equipment selection and asset analysis – automated"
- **metaDescription:** "Custom Excel, VBA and app solutions for engineering, energy and utility teams: equipment sizing and selection logic, asset data analysis, project costing and reporting."
- **primaryKeywords:** us ["engineering calculation spreadsheet developer", "excel automation for utilities", "equipment sizing tool excel", "energy company excel consultant", "asset data analysis tool"] · uk ["engineering excel consultant uk", "utilities data automation uk"] · nz ["engineering excel consultant nz", "utilities reporting automation nz"]
- **introLead:** "Engineering teams hold huge amounts of technical data. The value is in applying the right rules to it, consistently and quickly."
- **intro:** "Equipment specifications, ratings, sizes, materials and field data often sit in spreadsheets and legacy tools, and checking whether a component fits an application can mean hours of manual lookups and calculations.\n\nWe turn that engineering knowledge into rule-based Excel tools and custom applications. Load your technical data, apply the selection and validation logic, and get a clear, documented result that shows whether a component suits the application, with the reasoning visible to the engineer who signs it off."
- **challenges:** "Equipment selection and compatibility checks are manual and slow"; "Technical datasheets and ratings live in disconnected spreadsheets"; "Engineering calculations depend on one expert's workbook"; "Asset and maintenance data is hard to analyse across sites"; "Project estimates and reporting are rebuilt for every job"
- **solutions:** "Rule-based selection and compatibility tools (size, rating, material, application fit)" → `/excel-vba-macro-development`; "Engineering calculation workbooks with validation and audit trail" → `/excel-spreadsheet-development`; "Asset, maintenance and operations systems" → `/solutions/asset-maintenance-operations-solutions`; "Project costing and estimating models" → `/solutions/project-costing-financial-modelling`; "Field data capture and inspection apps" → `/solutions/survey-inspection-field-apps`
- **aiSection:** heading "Where AI fits in engineering" · intro "AI helps engineers find and compare information; the rules and sign-off stay deterministic and human." · bullets: "Extract specifications from manufacturer datasheets into a structured component library"; "Suggest candidate components for an engineer to validate against the rules"; "Summarise inspection notes and defect reports across assets"
- **toolsWeConnect:** us ["SAP PM exports", "Maximo exports", "GIS / ArcGIS exports", "SQL Server", "SharePoint", "Power BI"] · uk ["SAP PM exports", "Maximo exports", "GIS exports", "SQL Server", "SharePoint", "Power BI"] · nz ["SAP PM exports", "Maximo exports", "GIS exports", "SQL Server", "SharePoint", "Power BI"]
- **complianceNote (base):** "We build tools that apply your engineering standards and document the logic used. Final engineering judgement and sign-off stay with your qualified engineers."
- **faqs:** "Can you turn our existing selection spreadsheet into a proper tool?" → "Yes. That's a common starting point. We take your current logic, formalise the rules, add validation and make it usable by the wider team."; "Can it handle thousands of components and specifications?" → "Yes. We structure the data as a proper component library and use Power Query, SQL or an app where volume demands it."; "Will engineers be able to see why a result was given?" → "Yes. Every result shows the rules and inputs that produced it."; "Can field teams use it?" → "We can extend it to tablet or web-based field apps."
- **relatedServices:** ["excel-vba-macro-development", "excel-spreadsheet-development", "web-applications", "power-apps-dataverse-development", "ai-workflow-and-business-process-automation"]
- **relatedSolutions:** ["asset-maintenance-operations-solutions", "project-costing-financial-modelling", "survey-inspection-field-apps"]
- **ctaHeading:** "Have an engineering spreadsheet that's outgrown itself? Send it to us"

---

### 7.4 Construction & Property
- **slug:** `construction-property` · **navLabel:** Construction & Property · **order:** 4
- **caseStudySectors:** ["Construction", "Property", "Property Development"]
- **seoTitle:** us "Excel Estimating & Costing for Construction US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Estimating, job costing and project control tools for construction and property"
- **metaDescription:** "Custom Excel estimating, quoting and job-costing tools for builders, contractors and developers. Faster quotes, tighter margins, live project cost tracking."
- **primaryKeywords:** us ["construction estimating spreadsheet", "excel job costing for contractors", "construction cost estimating excel consultant", "property development feasibility model"] · uk ["construction estimating excel uk", "job costing spreadsheet contractors uk", "development appraisal model excel"] · nz ["construction estimating excel nz", "job costing builders nz", "property development feasibility nz"]
- **introLead:** "Margins in construction are won or lost in the estimate and the cost report."
- **intro:** "Estimators juggle rates, quantities, variations and supplier prices across workbooks that grow with every job. Off-the-shelf estimating software rarely fits how a specialist contractor actually prices work, so Excel stays at the centre.\n\nWe build estimating, quoting and job-costing tools around your pricing logic, from renovation costing apps to development feasibility models, so quotes are faster and consistent and actual costs track against budget as the job runs."
- **challenges:** "Quotes take too long and vary by estimator"; "Rates and supplier prices go stale across many workbooks"; "Variations and change orders aren't tracked against budget"; "Job cost reporting lags behind what's happening on site"; "Development feasibility models are fragile and hard to scenario-test"
- **solutions:** "Quoting and estimating systems" → `/solutions/quoting-estimating-systems`; "Job costing and project cost control" → `/solutions/project-costing-financial-modelling`; "Property development feasibility and appraisal models" → `/solutions/property-development-applications`; "Site inspection and survey apps" → `/solutions/survey-inspection-field-apps`; "Resource and crew scheduling" → `/solutions/resource-planning-scheduling`
- **aiSection:** heading "Where AI fits in construction" · intro "AI is useful at the messy edges of estimating." · bullets: "Extract quantities and line items from supplier quotes and PDFs"; "Compare tendered prices against historical rates"; "Summarise site reports and variation notes"
- **toolsWeConnect:** us ["Procore", "QuickBooks", "Sage 300 CRE", "Buildertrend exports", "SharePoint"] · uk ["Sage", "Xero", "COINS exports", "Procore", "SharePoint"] · nz ["Xero", "MYOB", "Simpro", "Buildxact exports", "SharePoint"]
- **complianceNote:** uk "Supports CIS deduction tracking in subcontractor cost reports." · nz/us: omit
- **faqs:** "Why not just buy estimating software?" → "Packaged tools suit standard work. If your pricing logic is specialised, a custom tool fits it better and costs less to change."; "Can the estimator's existing workbook be the starting point?" → "Yes. We keep what works and rebuild the rest."; "Can it produce a branded quote document?" → "Yes. Quotes can be generated to PDF or Word from the estimate."; "Can actual costs feed back in?" → "Yes, from your accounting or job management system."
- **relatedServices:** ["excel-spreadsheet-development", "excel-vba-macro-development", "excel-financial-modelling", "web-applications"]
- **relatedSolutions:** ["quoting-estimating-systems", "project-costing-financial-modelling", "property-development-applications", "resource-planning-scheduling"]
- **ctaHeading:** "Quote faster and protect your margin"

---

### 7.5 Manufacturing & FMCG
- **slug:** `manufacturing-fmcg` · **navLabel:** Manufacturing & FMCG · **order:** 5
- **caseStudySectors:** ["Manufacturing", "FMCG"]
- **seoTitle:** us "Excel Automation for Manufacturing & CPG US" · uk "Excel Automation for Manufacturing & FMCG UK" · nz "… FMCG NZ"
- **h1:** us "Costing, production and KPI tools for manufacturers and CPG brands" · uk/nz "Costing, production and KPI tools for manufacturers and FMCG brands"
- **metaDescription:** "Product costing, BOM, production planning and KPI dashboards in Excel and custom apps. Built for manufacturers and consumer goods businesses."
- **primaryKeywords:** us ["manufacturing cost model excel", "production dashboard excel", "bill of materials costing tool", "cpg sales and operations reporting"] · uk ["manufacturing costing excel uk", "fmcg reporting automation uk", "production kpi dashboard"] · nz ["manufacturing costing nz", "production dashboard excel nz", "fmcg reporting nz"]
- **introLead:** "From raw material to shelf price, manufacturers need numbers they can trust and update quickly."
- **intro:** "Product costing, bills of materials, production schedules and sales reporting often run across a patchwork of ERP exports and spreadsheets. When input costs move, it can take days to see the effect on margin.\n\nWe build costing models, BOM and quoting tools, production planning workbooks and KPI dashboards that pull from your ERP, recalculate instantly and show operations, sales and finance the same version of the truth."
- **challenges:** "Product costs don't update when material or labour rates change"; "BOMs and routings are maintained in multiple places"; "Production and OEE reporting is manual"; "Promotional and trade spend is hard to evaluate"; "ERP reports don't answer day-to-day operational questions"
- **solutions:** "Manufacturing costing, estimating and quoting" → `/solutions/manufacturing-costing-estimating-quoting`; "Production KPI and OEE dashboards" → `/solutions/dashboards-business-intelligence`; "Production and capacity planning" → `/solutions/resource-planning-scheduling`; "ERP-to-Excel integrations" → `/excel-integrations`; "Sales, promotion and margin analysis" → `/excel-dashboard-development`
- **aiSection:** heading "Where AI fits in manufacturing" · intro "Use AI to cut the reading and re-keying around production data." · bullets: "Extract supplier price changes from emails and PDFs into the cost model"; "Flag unusual yield, scrap or downtime patterns"; "Draft weekly operations summaries from dashboard data"
- **toolsWeConnect:** us ["NetSuite", "SAP Business One", "Epicor", "Microsoft Dynamics", "QuickBooks", "SQL Server"] · uk ["Sage 200", "SAP Business One", "Microsoft Dynamics", "Xero", "SQL Server"] · nz ["MYOB Advanced", "Xero", "SAP Business One", "Microsoft Dynamics", "Unleashed", "SQL Server"]
- **faqs:** "Can you build a costing model that updates from our ERP?" → "Yes. We pull current material, labour and overhead rates automatically so costs and margins stay current."; "We have a production dashboard already. Can you improve it?" → "Yes. We often rebuild existing dashboards for speed, accuracy and automatic refresh."; "Can it handle multi-level BOMs?" → "Yes, including sub-assemblies and alternative routings."; "Do we need Power BI?" → "No. Excel dashboards work well; we recommend Power BI only where it clearly adds value."
- **relatedServices:** ["excel-dashboard-development", "excel-integrations", "excel-spreadsheet-development", "power-query-consulting"]
- **relatedSolutions:** ["manufacturing-costing-estimating-quoting", "dashboards-business-intelligence", "resource-planning-scheduling"]
- **ctaHeading:** "See your true product margin today"
- **Note:** link the existing manufacturing KPI dashboard blog post from this page on .co.nz only (it's NZ-titled). On .com/.co.uk, link the US/UK version when it exists.

---

### 7.6 Marine & Boat Building
- **slug:** `marine-boat-building` · **navLabel:** Marine & Boat Building · **order:** 6
- **caseStudySectors:** ["Marine"]
- **seoTitle:** us "Boat Building Costing & Quoting Software US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Package costing, quoting and build tracking for boat builders"
- **metaDescription:** "Custom costing and quoting applications for boat builders and marine manufacturers. Price options and packages accurately and track every build."
- **primaryKeywords:** us ["boat builder quoting software", "boat package costing tool", "marine manufacturing costing excel"] · uk ["boat builder costing software uk", "marine quoting tool uk"] · nz ["boat builder costing software nz", "marine manufacturing quoting nz"]
- **introLead:** "Every boat is a combination of hull, engine, options and labour, and every combination needs a reliable price."
- **intro:** "Boat builders price complex packages with hundreds of option combinations, fluctuating component costs and significant labour content. Generic quoting software rarely handles that configurability, so pricing ends up in large, fragile spreadsheets.\n\nWe've built package costing applications for custom boat builders that configure models and options, calculate true cost and margin, and generate customer-ready quotes. Build tracking then measures actual hours and materials against the quote."
- **challenges:** "Option and package combinations make pricing error-prone"; "Component and engine costs change frequently"; "Labour hours per build are estimated, not measured"; "Dealer and direct pricing need different margins"; "Quote documents are assembled by hand"
- **solutions:** "Package and option costing applications" → `/solutions/manufacturing-costing-estimating-quoting`; "Configurable quoting with customer-ready output" → `/solutions/quoting-estimating-systems`; "Build cost tracking (quote vs actual)" → `/solutions/project-costing-financial-modelling`; "Production slot and resource planning" → `/solutions/resource-planning-scheduling`; "Dealer and customer portals" → `/solutions/client-staff-portals`
- **aiSection:** heading "Where AI fits in boat building" · intro "Practical, low-risk uses." · bullets: "Update component pricing from supplier price lists"; "Generate first-draft specification sheets from the configured build"; "Spot builds trending over budget early"
- **toolsWeConnect:** us ["QuickBooks", "NetSuite", "SharePoint", "SQL Server"] · uk ["Xero", "Sage", "SharePoint", "SQL Server"] · nz ["Xero", "MYOB", "SharePoint", "SQL Server"]
- **faqs:** "Can it handle hundreds of option combinations?" → "Yes. Options are rule-driven, so invalid combinations are blocked and prices recalculate instantly."; "Can dealers use it?" → "Yes, via a controlled workbook or a web portal with dealer pricing."; "Can we compare quoted and actual cost per hull?" → "Yes. Build tracking reports margin by model and build."; "Does it produce a branded quote?" → "Yes, as PDF or Word."
- **relatedServices:** ["excel-spreadsheet-development", "excel-vba-macro-development", "web-applications"]
- **relatedSolutions:** ["manufacturing-costing-estimating-quoting", "quoting-estimating-systems", "project-costing-financial-modelling"]
- **ctaHeading:** "Price every build with confidence"

---

### 7.7 Timber Processing & Forestry
- **slug:** `timber-forestry` · **navLabel:** Timber & Forestry · **order:** 7
- **caseStudySectors:** ["Timber", "Forestry"]
- **seoTitle:** us "Excel Tools for Sawmills & Timber Processing US" · uk "Excel Tools for Timber Processing UK" · nz "Excel Tools for Timber Processing & Forestry NZ"
- **h1 (base):** "Yield, costing and production tools for timber processors and forestry operations"
- **metaDescription:** "Custom Excel and app solutions for sawmills, timber processors and forestry: recovery and yield analysis, log-to-product costing, production and stock reporting."
- **primaryKeywords:** us ["sawmill yield spreadsheet", "lumber costing tool", "sawmill production reporting"] · uk ["timber processing costing excel", "sawmill reporting uk"] · nz ["sawmill software nz", "timber processing costing nz", "forestry reporting excel nz"]
- **introLead:** "In timber, small changes in recovery and grade mix make a big difference to profit."
- **intro:** "Processors need to know what each log input is really worth once it's cut, dried, graded and sold, and that depends on recovery rates, product mix and constantly changing prices.\n\nWe build recovery and yield models, log-to-product costing, production and stock reporting and dispatch tools that bring together mill, sales and finance data so managers can see margin by input, shift and product."
- **challenges:** "Recovery and yield are measured inconsistently"; "Costing by log grade and product mix is hard to calculate"; "Stock and kiln/drying status is tracked manually"; "Production reporting relies on end-of-shift spreadsheets"; "Pricing changes aren't reflected in margin quickly"
- **solutions:** "Recovery, yield and grade-mix analysis" → `/excel-dashboard-development`; "Log-to-product costing models" → `/solutions/manufacturing-costing-estimating-quoting`; "Production and stock dashboards" → `/solutions/dashboards-business-intelligence`; "Shift, kiln and resource scheduling" → `/solutions/resource-planning-scheduling`; "Integration with mill and accounting systems" → `/excel-integrations`
- **aiSection:** heading "Where AI fits in timber processing" · intro "Mostly about speeding up reporting." · bullets: "Read docket and dispatch documents into structured data"; "Flag shifts with abnormal recovery or downtime"; "Draft weekly production commentary for managers"
- **toolsWeConnect:** us ["QuickBooks", "NetSuite", "SQL Server", "Mill system exports"] · uk ["Sage", "Xero", "SQL Server", "Mill system exports"] · nz ["Xero", "MYOB", "SQL Server", "Mill system exports"]
- **faqs:** "Can you work with our mill system's exports?" → "Yes. We build repeatable imports from CSV or database exports."; "Can we see margin by log input?" → "Yes. That's usually the core of the model."; "Will supervisors be able to use it on shift?" → "Yes, with simple data-entry forms or a tablet app."; "Can it replace our end-of-shift spreadsheets?" → "Yes, with one consistent capture and reporting tool."
- **relatedServices:** ["excel-dashboard-development", "excel-integrations", "excel-spreadsheet-development", "power-apps-dataverse-development"]
- **relatedSolutions:** ["manufacturing-costing-estimating-quoting", "dashboards-business-intelligence", "resource-planning-scheduling"]
- **ctaHeading:** "Know your margin by log, shift and product"

---

### 7.8 Landscaping & Field Services
- **slug:** `landscaping-field-services` · **navLabel:** Landscaping & Field Services · **order:** 8
- **caseStudySectors:** ["Landscaping", "Field Services", "Cemetery", "Grounds"]
- **seoTitle:** us "Quoting & Scheduling Tools for Landscaping & Field Services US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Quoting, crew scheduling and job tracking for landscaping and field service businesses"
- **metaDescription:** "Custom quoting, scheduling and job-costing tools for landscapers, grounds maintenance and field service teams. Quote faster, schedule smarter, track every job."
- **primaryKeywords:** us ["landscaping estimating spreadsheet", "landscape quoting tool", "field service scheduling excel", "grounds maintenance job costing"] · uk ["landscaping quoting tool uk", "grounds maintenance scheduling uk"] · nz ["landscaping quoting nz", "grounds maintenance scheduling nz"]
- **introLead:** "Field businesses make money when quotes are accurate and crews are in the right place."
- **intro:** "Landscapers and field service teams price work from measurements, materials and labour, then juggle crews, equipment and recurring maintenance schedules. Generic job apps often miss how you actually quote and plan.\n\nWe build quoting tools, crew and maintenance schedulers, mobile job capture and job-costing reports so office and field work from the same data."
- **challenges:** "Quotes are built from scratch for each site"; "Recurring maintenance rounds are scheduled manually"; "Crew time and materials aren't captured accurately in the field"; "Job profitability is only known after the fact"; "Equipment and vehicle allocation clashes"
- **solutions:** "Measurement-based quoting tools" → `/solutions/quoting-estimating-systems`; "Crew and maintenance round scheduling" → `/solutions/resource-planning-scheduling`; "Mobile job and site capture apps" → `/solutions/survey-inspection-field-apps`; "Job costing and profitability dashboards" → `/solutions/dashboards-business-intelligence`; "Customer and staff portals" → `/solutions/client-staff-portals`
- **aiSection:** heading "Where AI fits in field services" · intro "Practical time savers." · bullets: "Turn site photos and notes into structured job records"; "Draft quote descriptions from measured scope"; "Highlight jobs running over estimated hours"
- **toolsWeConnect:** us ["QuickBooks", "Jobber exports", "Google Sheets", "SharePoint"] · uk ["Xero", "Sage", "Google Sheets", "SharePoint"] · nz ["Xero", "MYOB", "Google Sheets", "SharePoint"]
- **faqs:** "Can crews use it on a phone?" → "Yes. We build simple mobile capture forms or field apps."; "Can it schedule recurring maintenance?" → "Yes, including rounds, frequencies and crew allocation."; "Can we quote from measurements?" → "Yes. Enter areas and quantities and the tool prices materials and labour."; "Do we need to replace our accounting system?" → "No. We integrate with it."
- **relatedServices:** ["google-sheets-development", "power-apps-dataverse-development", "excel-spreadsheet-development", "web-applications"]
- **relatedSolutions:** ["quoting-estimating-systems", "resource-planning-scheduling", "survey-inspection-field-apps"]
- **ctaHeading:** "Spend less time quoting and more time on the tools"

---

### 7.9 Hospitality & Tourism
- **slug:** `hospitality` · **navLabel:** Hospitality & Tourism · **order:** 9
- **caseStudySectors:** ["Hospitality"]
- **seoTitle:** us "Excel & App Solutions for Hotels & Hospitality US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Operational apps, reporting and automation for hotels and hospitality groups"
- **metaDescription:** "Custom apps and Excel automation for hotels and hospitality: guest-service apps, rostering, revenue and cost reporting, and operational dashboards."
- **primaryKeywords:** us ["hotel operations app", "hospitality reporting automation", "hotel labor cost dashboard"] · uk ["hotel operations app uk", "hospitality reporting automation uk"] · nz ["hospitality reporting nz", "hotel operations app nz"]
- **introLead:** "Hospitality runs on fast operational decisions, and too many still depend on paper and spreadsheets."
- **intro:** "Hotels and hospitality groups manage guest services, staff rosters, revenue, food and labour costs across systems that rarely talk to each other. Operational gaps get filled with paper forms and manual spreadsheets.\n\nWe build practical hybrid apps and automated reporting, from a valet parking application for an international hotel to rostering and cost dashboards, that close those gaps without replacing your PMS or POS."
- **challenges:** "Guest-service processes run on paper or ad-hoc spreadsheets"; "Rostering and labour cost control are manual"; "Revenue, F&B and labour reports are compiled by hand"; "PMS and POS data don't combine easily"; "Multi-site reporting is inconsistent"
- **solutions:** "Operational hybrid apps (e.g. valet, service requests)" → `/web-applications`; "Rostering and labour planning" → `/solutions/resource-planning-scheduling`; "Revenue, F&B and labour dashboards" → `/solutions/dashboards-business-intelligence`; "PMS/POS data integrations" → `/excel-integrations`; "Staff portals and checklists" → `/solutions/client-staff-portals`
- **aiSection:** heading "Where AI fits in hospitality" · intro "Small, high-frequency wins." · bullets: "Summarise guest feedback and reviews by theme"; "Forecast staffing needs from occupancy and bookings"; "Read supplier invoices into cost reports"
- **toolsWeConnect:** us ["Oracle OPERA exports", "Toast exports", "QuickBooks", "Power BI"] · uk ["Oracle OPERA exports", "Lightspeed exports", "Xero", "Power BI"] · nz ["Oracle OPERA exports", "Lightspeed exports", "Xero", "Power BI"]
- **faqs:** "Do we need to replace our PMS or POS?" → "No. We work alongside them using their exports or APIs."; "Can staff use it on phones or tablets?" → "Yes. Our hybrid apps are built for front-line use."; "Can you consolidate multiple properties?" → "Yes, into one consistent reporting model."; "How long does a typical app take?" → "Focused operational apps often take weeks, not months."
- **relatedServices:** ["web-applications", "power-apps-dataverse-development", "excel-dashboard-development", "excel-integrations"]
- **relatedSolutions:** ["resource-planning-scheduling", "dashboards-business-intelligence", "client-staff-portals"]
- **ctaHeading:** "Replace the paper and spreadsheets behind your operations"

---

### 7.10 Facilities Management & Maintenance
- **slug:** `facilities-management` · **navLabel:** Facilities Management · **order:** 10
- **caseStudySectors:** ["Facilities Management"]
- **seoTitle:** us "Maintenance Scheduling & FM Reporting Tools US" · uk "… UK" · nz "… NZ"
- **h1 (base):** "Maintenance scheduling, contract reporting and asset tools for facilities management"
- **metaDescription:** "Custom maintenance scheduling, optimisation and contract reporting tools for facilities management contractors and in-house FM teams."
- **primaryKeywords:** us ["maintenance scheduling spreadsheet", "facilities management reporting tool", "preventive maintenance planner excel"] · uk ["facilities management reporting uk", "planned maintenance scheduling tool uk"] · nz ["maintenance scheduling nz", "facilities management reporting nz"]
- **introLead:** "FM contracts are won on price and kept on performance, and both depend on good scheduling and reporting."
- **intro:** "Facilities teams manage planned maintenance, reactive work, contract KPIs and staff across many sites. CAFM systems hold the records, but scheduling optimisation and client reporting often fall back to spreadsheets.\n\nWe've built maintenance scheduling and optimisation tools for FM contractors that balance workload, travel and SLAs, along with contract KPI reporting and asset dashboards."
- **challenges:** "Planned maintenance schedules are balanced by hand"; "SLA and contract KPI reporting takes days each month"; "Staff, travel and site allocation is inefficient"; "Asset condition data is scattered"; "Client reports differ for every contract"
- **solutions:** "Maintenance scheduling and optimisation" → `/solutions/resource-planning-scheduling`; "Asset maintenance and operations systems" → `/solutions/asset-maintenance-operations-solutions`; "Contract KPI and SLA dashboards" → `/solutions/dashboards-business-intelligence`; "Inspection and site audit apps" → `/solutions/survey-inspection-field-apps`; "Client reporting portals" → `/solutions/client-staff-portals`
- **aiSection:** heading "Where AI fits in facilities management" · intro "Use AI to process the volume." · bullets: "Categorise reactive job requests automatically"; "Summarise inspection findings across sites"; "Draft monthly contract performance commentary"
- **toolsWeConnect:** us ["CAFM/CMMS exports", "Maximo", "ServiceNow exports", "SharePoint", "Power BI"] · uk ["CAFM exports", "Maximo", "Concept Evolution exports", "SharePoint", "Power BI"] · nz ["CAFM exports", "Maximo", "SharePoint", "Power BI"]
- **faqs:** "Can you optimise schedules across multiple sites?" → "Yes. We balance frequencies, technician capacity and travel to produce workable schedules."; "Will it work with our CAFM system?" → "Yes, via exports or APIs. We extend rather than replace it."; "Can each client get their own report format?" → "Yes. Templates are driven per contract."; "Can technicians record work in the field?" → "Yes, via mobile capture."
- **relatedServices:** ["excel-vba-macro-development", "excel-dashboard-development", "power-apps-dataverse-development", "web-applications"]
- **relatedSolutions:** ["resource-planning-scheduling", "asset-maintenance-operations-solutions", "dashboards-business-intelligence", "survey-inspection-field-apps"]
- **ctaHeading:** "Balance your maintenance schedule and report with less effort"

---

## 8. SEO & quality rules

- One H1 per page (regional). H2s as in section 3. Use the primary keywords naturally in H1, introLead, one H2 and at least one FAQ. No keyword stuffing and no rendered keyword lists.
- Title format: `{seoTitle} | XLS Experts`. The layout appends the suffix once. Check there's no double suffix (a previously fixed bug).
- Meta description 140–160 characters. Truncate the seed copy if needed.
- All internal links are `<Link>` anchors (crawlable). No JS-only navigation.
- Images: descriptive alt text including the industry name.
- Lighthouse: no regressions against the existing service pages.

## 9. Related fix (same PR)

The current catch-all route returns **200 + blog index + "index, follow"** for any unknown 2-level URL (e.g. `/zzz/anything`, `/case-studies/anything`). Fix it so unknown routes return a real 404 via `notFound()`. Add 301 redirects for legacy Wix `/post/{slug}` URLs to the matching `/blog/{slug}` where a match exists.

## 10. Acceptance checklist

- [ ] `/industries` and 10 `/industries/[slug]` pages render on .com, .co.uk and .co.nz.
- [ ] Regional H1/title/meta/keywords/tools/proofLine/FAQ overrides resolve correctly. .com uses US spelling; no NZ strings leak to .com/.co.uk.
- [ ] Case-study cards: client names on .co.nz, anonymised descriptors on .com/.co.uk, all linking to `/case-studies/[slug]`.
- [ ] Nav dropdown, footer column, homepage strip, and reverse "Industries we do this for" chips on service/solution pages.
- [ ] Sitemaps include the new URLs for each region's host only. Hreflang and canonicals correct.
- [ ] Service + FAQPage + BreadcrumbList JSON-LD validates (Rich Results Test).
- [ ] Enquiry form on industry pages lands on `/thank-you` and fires the existing conversion (verify the GTM history-change trigger fires).
- [ ] Unknown URLs return 404. Legacy `/post/` URLs 301 to `/blog/`.
- [ ] All industry content is editable in the existing CMS backend, same as Services/Solutions.
