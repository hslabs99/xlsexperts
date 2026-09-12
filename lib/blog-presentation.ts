import type { MarketId } from '@/lib/market'
import type { BlogPost, BlogSection } from '@/lib/types'
import { serpTokensForMarket } from '@/lib/regions'
import { fillSerpTemplate } from '@/lib/serp-copy'

const AI_WORKFLOW_SLUG = 'ai-workflow-automation-new-zealand-business'
const AI_SERVICE_HREF = '/ai-workflow-and-business-process-automation'

type BlogPresentation = {
  title: string
  excerpt: string
  lead?: string
  rewriteHeadings?: Record<string, string>
}

const PRESENTATIONS: Record<string, BlogPresentation> = {
  [AI_WORKFLOW_SLUG]: {
    title: 'How teams actually run AI workflows in Excel',
    excerpt:
      'Real examples of AI sitting on top of Excel: reading documents, classifying work, and drafting commentary — without ripping out the spreadsheet. See how {region} teams start.',
    lead: `If you already know you need this built, start with our [AI workflow automation services](${AI_SERVICE_HREF}). This article is the how-it-works view: examples, a typical build path, and where Excel stays in the loop.`,
    rewriteHeadings: {
      'What is A.I. Workflow Automation?':
        'What these workflows look like day to day',
      Conclusion:
        'Where this usually goes next',
    },
  },
}

function applyHeadingRewrites(
  sections: BlogSection[],
  rewrites: Record<string, string> | undefined
): BlogSection[] {
  if (!rewrites) return sections
  return sections.map((section) => {
    if (!section.heading) return section
    const next = rewrites[section.heading]
    return next ? { ...section, heading: next } : section
  })
}

export function applyBlogPresentation<
  T extends Pick<BlogPost, 'slug' | 'title' | 'excerpt'> & { sections?: BlogSection[] },
>(post: T, market: MarketId): T {
  const spec = PRESENTATIONS[post.slug]
  if (!spec) return post

  const tokens = serpTokensForMarket(market)
  const title = fillSerpTemplate(spec.title, tokens)
  const excerpt = fillSerpTemplate(spec.excerpt, tokens)
  if (!post.sections) {
    return { ...post, title, excerpt }
  }

  let sections = applyHeadingRewrites(post.sections, spec.rewriteHeadings)
  if (spec.lead) {
    const lead = fillSerpTemplate(spec.lead, tokens)
    const already = sections.some(
      (section) => section.type === 'intro' && section.text?.includes(AI_SERVICE_HREF)
    )
    if (!already) {
      sections = [{ type: 'intro', text: lead }, ...sections]
    }
  }
  return { ...post, title, excerpt, sections }
}
