/**
 * Client-safe types for case-study AI assist (shared with admin UI).
 * Server generation lives in `lib/case-study-ai.ts`.
 */

export type CaseStudyAiDraft = {
  title: string
  client: string
  sector: string
  slug: string
  problem: string
  solution: string
  outcome: string
  tags: string[]
  serviceSlugs: string[]
  solutionSlugs: string[]
  imagePrompt: string
  summary: string
}
