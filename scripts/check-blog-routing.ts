import assert from 'node:assert/strict'
import {
  buildBlogAlternates,
  effectivePrimaryRegion,
  fuzzyDecision,
  matchService,
  primaryToStore,
  rankPosts,
  recoveryKeywords,
  type RoutingPost,
} from '../lib/blog-routing'
import { blogRoutingDecisions } from '../lib/blog-decisions'

function post(partial: Partial<RoutingPost> & Pick<RoutingPost, 'slug' | 'title'>): RoutingPost {
  return {
    excerpt: '',
    category: 'Guides',
    showNz: true,
    showUsa: false,
    showUk: false,
    primaryRegion: null,
    sortOrder: 1,
    ...partial,
  }
}

const nzOnly = buildBlogAlternates('/blog/example', ['nz'], 'nz')
assert.equal(nzOnly, undefined, 'single region emits no hreflang')

const nzUk = buildBlogAlternates('/blog/example', ['nz', 'uk'], 'nz')
assert.ok(nzUk)
assert.equal(nzUk['en-NZ'], 'https://www.xlsexperts.co.nz/blog/example')
assert.equal(nzUk['en-GB'], 'https://www.xlsexperts.co.uk/blog/example')
assert.equal(nzUk['x-default'], 'https://www.xlsexperts.co.nz/blog/example')
assert.equal(nzUk['en-US'], undefined)

assert.equal(
  effectivePrimaryRegion({
    showNz: true,
    showUsa: true,
    showUk: true,
    primaryRegion: null,
  }),
  'nz'
)
assert.equal(
  effectivePrimaryRegion({
    showNz: true,
    showUsa: true,
    showUk: false,
    primaryRegion: 'intl',
  }),
  'intl'
)
assert.equal(
  primaryToStore({ showNz: true, showUsa: true, showUk: false }, null),
  'nz'
)
assert.equal(
  primaryToStore({ showNz: true, showUsa: false, showUk: false }, null),
  'nz'
)

const catalogue = [
  post({
    slug: 'excel-solutions-nz-streamline-your-workflow-and-boost-your-productivity',
    title: 'Excel solutions NZ streamline your workflow',
    showNz: true,
    showUsa: false,
    showUk: false,
  }),
  post({
    slug: 'dashboards-for-managers',
    title: 'Dashboards for managers',
    category: 'Dashboards',
    sortOrder: 2,
  }),
]

const ranked = rankPosts(
  '/post/excel-solutions-nz-streamline-your-workflow-and-boost-your-productivity',
  catalogue
)
const decision = fuzzyDecision(ranked)
assert.ok(decision.redirect, 'old slug should clear the redirect threshold')
assert.equal(
  decision.redirect?.post.slug,
  'excel-solutions-nz-streamline-your-workflow-and-boost-your-productivity'
)

const weak = fuzzyDecision(
  rankPosts('/post/completely-unrelated-topic-about-gardening', catalogue)
)
assert.equal(weak.redirect, null)

assert.equal(matchService('/post/automated-daily-site-reports')?.title, 'Workflow automation')
assert.equal(matchService('/blog/costing-and-quoting-guide')?.title, 'Quoting & Estimating Systems')
assert.equal(matchService('/blog/excel-dashboard-kpi')?.title, 'Dashboards & BI')

assert.match(recoveryKeywords('/post/excel-solutions-nz-streamline'), /solutions/)
assert.doesNotMatch(recoveryKeywords('/post/excel-solutions-nz-streamline'), /\bnz\b/)

const flagged = blogRoutingDecisions({
  slug: 'excel-solutions-energy-utilities-new-zealand',
  title: 'Excel solutions for energy utilities in New Zealand',
  published: true,
  showNz: true,
  showUsa: true,
  showUk: true,
  primaryRegion: null,
  sections: [],
})
const recommended = flagged.find((item) => item.recommended)
assert.equal(recommended?.code, 'search-console')
assert.equal(recommended?.patch?.primaryRegion, 'nz')
assert.equal(recommended?.patch?.showNz, true)
assert.equal(recommended?.patch?.showUsa, true)
assert.equal(recommended?.patch?.showUk, true)

const neutral = blogRoutingDecisions({
  slug: 'enterprise-excel-automation-scaling-business-processes',
  title: 'Enterprise Excel Automation: Scaling Business Processes with VBA and Power Query',
  published: true,
  showNz: true,
  showUsa: true,
  showUk: true,
  primaryRegion: null,
  sections: [],
})
assert.equal(
  neutral.filter((item) => item.code === 'primary-unset').length,
  0
)
assert.ok(neutral.some((item) => item.recommended && item.patchLabel === 'Set primary to NZ'))
assert.ok(neutral.some((item) => item.patchLabel === 'Publish on NZ only'))

const quiet = blogRoutingDecisions({
  slug: 'excel-solutions-energy-utilities-new-zealand',
  title: 'Excel solutions for energy utilities in New Zealand',
  published: true,
  showNz: true,
  showUsa: false,
  showUk: false,
  primaryRegion: 'nz',
  sections: [],
})
assert.equal(quiet.length, 0)

console.log('blog routing checks passed')
