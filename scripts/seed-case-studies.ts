/**
 * CLI: seed Firestore caseStudies from the frozen archive.
 *
 *   npm run seed:case-studies
 *   npm run seed:case-studies -- --images
 *   npm run seed:case-studies -- --skip-home
 */

import { seedCaseStudiesFromArchive } from '../lib/case-studies-seed'

async function main() {
  const args = new Set(process.argv.slice(2))
  const result = await seedCaseStudiesFromArchive({
    overwrite: true,
    uploadImages: args.has('--images'),
    publishHome: !args.has('--skip-home'),
  })
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
