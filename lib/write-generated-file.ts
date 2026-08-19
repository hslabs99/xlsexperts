import { copyFile, rename, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

/**
 * Write a generated TypeScript module without leaving an empty/truncated file
 * for Turbopack to compile. Direct writeFile on the destination truncates first;
 * Next then reports “module has no exports” and takes down the app.
 */
export async function writeGeneratedFile(
  relativePath: string,
  contents: string
): Promise<string> {
  const dest = path.join(process.cwd(), relativePath)
  const tmp = `${dest}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`
  await writeFile(tmp, contents, 'utf8')
  try {
    await rename(tmp, dest)
  } catch {
    await copyFile(tmp, dest)
    await unlink(tmp).catch(() => undefined)
  }
  return dest
}

/** Pull the JSON object out of a generated `const published = { ... } as Type` module. */
export function parseGeneratedPublishedJson(fileText: string): unknown | null {
  const marker = 'const published = '
  const start = fileText.indexOf(marker)
  if (start < 0) return null
  const fromBrace = fileText.indexOf('{', start)
  const asIdx = fileText.lastIndexOf('} as ')
  if (fromBrace < 0 || asIdx < fromBrace) return null
  try {
    return JSON.parse(fileText.slice(fromBrace, asIdx + 1)) as unknown
  } catch {
    return null
  }
}
