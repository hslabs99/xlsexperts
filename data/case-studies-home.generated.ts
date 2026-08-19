/**
 * PUBLISHED homepage case studies — imported by the public site (no Firestore on first paint).
 * Edit in Admin → Case Studies, then Publish homepage (or CMS → Publish).
 *
 * Generated at 2026-08-19T02:13:08.599Z
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedCaseStudiesHomeFile } from '@/lib/case-studies-home'

const published = {
  "version": 1,
  "publishedAt": "2026-08-19T02:13:08.599Z",
  "items": [
    {
      "slug": "maintenance-scheduling-ocs",
      "client": "1M / OCS Group",
      "sector": "Facilities Management",
      "title": "Maintenance Scheduling & Optimisation Tool",
      "image": "https://firebasestorage.googleapis.com/v0/b/xlsexperts-49c22.firebasestorage.app/o/case-studies%2Fmaintenance-scheduling-ocs%2Fhero.jpg?alt=media&token=6ac931df-1fbe-436c-b96d-325e1b6815b3",
      "problem": "Operations staff needed to schedule and optimise asset maintenance across clients and asset classes without leaving their existing SIMPRO platform.",
      "solution": "Built an Excel add-on interfacing with SIMPRO via CSV/EDI uploads, enabling exception reporting, schedule optimisation across asset classes, and automation routines that run outside the core platform.",
      "outcome": "Extended platform functionality delivered at a fraction of custom software cost, with zero changes required to the core business system.",
      "tags": [
        "Excel",
        "VBA",
        "EDI",
        "SIMPRO Integration"
      ],
      "serviceSlugs": [],
      "solutionSlugs": []
    },
    {
      "slug": "valet-parking-pullman",
      "client": "Pullman Hotel Auckland",
      "sector": "Hospitality",
      "title": "Valet Parking Hybrid App",
      "image": "https://firebasestorage.googleapis.com/v0/b/xlsexperts-49c22.firebasestorage.app/o/case-studies%2Fvalet-parking-pullman%2Fhero.jpg?alt=media&token=9fc36cd1-0376-43c0-841b-cbd1d224e0ea",
      "problem": "Valet staff needed a compact mobile app for bay management while admin needed a powerful parking console — both connected to the same live data.",
      "solution": "Enhanced an existing Excel tool as the admin dashboard, connected to a cloud MS SQL database. Built a companion mobile web app for parking staff sharing the same database with real-time inbound and outbound bay control.",
      "outcome": "A hybrid Excel + .NET solution delivering both a mobile-first field experience and an analytics-rich admin console — without building two separate systems.",
      "tags": [
        "Excel",
        "VBA",
        "SQL DB",
        "Mobile Web App",
        ".NET"
      ],
      "serviceSlugs": [],
      "solutionSlugs": []
    },
    {
      "slug": "claims-analysis-nzi",
      "client": "NZI",
      "sector": "Insurance",
      "title": "Claims Analysis Enterprise App",
      "image": "https://firebasestorage.googleapis.com/v0/b/xlsexperts-49c22.firebasestorage.app/o/case-studies%2Fclaims-analysis-nzi%2Fhero.jpg?alt=media&token=374371d9-32aa-487f-a519-ce139ff8d05a",
      "problem": "NZI required an enterprise app for collecting, collating, and reporting on claims analysis data that could be further analysed in-house using familiar tools.",
      "solution": "Built a web app for data collection via a browser interface, feeding into Excel via SQL DB connectivity. VBA automation processed and presented the data as pivot summaries and trend charts, leveraging Excel's familiar interface for the analysis team.",
      "outcome": "A full-stack enterprise solution built around Excel — giving analysts powerful reporting without retraining staff on new software.",
      "tags": [
        "Excel",
        "VBA",
        "SQL DB",
        "Web App",
        "Charting"
      ],
      "serviceSlugs": [],
      "solutionSlugs": []
    },
    {
      "slug": "financial-modelling-amp",
      "client": "AMP Financial Services",
      "sector": "Financial Services",
      "title": "Financial Modelling & Reporting Suite",
      "image": "https://firebasestorage.googleapis.com/v0/b/xlsexperts-49c22.firebasestorage.app/o/case-studies%2Ffinancial-modelling-amp%2Fhero.jpg?alt=media&token=22f024e1-e583-444d-9dc0-26e688337477",
      "problem": "AMP required extensible financial modelling tools that could connect to internal data systems and present complex data in a clear, auditable format.",
      "solution": "In-depth discovery followed by enhanced Excel modelling workbooks with VBA automation, EDI and SQL DB connectivity, and structured reporting outputs designed for both internal analysts and executive stakeholders.",
      "outcome": "Delivered a modelling suite that replaced manual processes, reduced reporting time significantly, and integrated cleanly with existing AMP data infrastructure.",
      "tags": [
        "Excel",
        "VBA",
        "EDI",
        "SQL DB",
        "Financial Modelling"
      ],
      "serviceSlugs": [],
      "solutionSlugs": []
    }
  ],
  "hasMore": true
} as PublishedCaseStudiesHomeFile

export const PUBLISHED_CASE_STUDIES_HOME = published

export default published
