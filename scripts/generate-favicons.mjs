/**
 * Build PNG/ICO favicons from the XLS Experts apple-icon mark.
 * Source of truth: app/apple-icon.png (green "xls" wordmark).
 */
import { writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'app', 'apple-icon.png')

const XLS_ICON_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="7" fill="#1a6b3c"/>
  <text x="16" y="21.4" text-anchor="middle" font-family="ui-sans-serif, system-ui, Segoe UI, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff">xls</text>
</svg>
`

function pngToIco(images) {
  const count = images.length
  const headerSize = 6 + 16 * count
  let offset = headerSize
  const entries = images.map((img) => {
    const entry = {
      width: img.width >= 256 ? 0 : img.width,
      height: img.height >= 256 ? 0 : img.height,
      size: img.data.length,
      offset,
    }
    offset += img.data.length
    return entry
  })

  const buf = Buffer.alloc(offset)
  buf.writeUInt16LE(0, 0)
  buf.writeUInt16LE(1, 2)
  buf.writeUInt16LE(count, 4)

  let pos = 6
  for (const entry of entries) {
    buf.writeUInt8(entry.width, pos)
    buf.writeUInt8(entry.height, pos + 1)
    buf.writeUInt8(0, pos + 2)
    buf.writeUInt8(0, pos + 3)
    buf.writeUInt16LE(1, pos + 4)
    buf.writeUInt16LE(32, pos + 6)
    buf.writeUInt32LE(entry.size, pos + 8)
    buf.writeUInt32LE(entry.offset, pos + 12)
    pos += 16
  }

  for (const img of images) {
    img.data.copy(buf, pos)
    pos += img.data.length
  }

  return buf
}

async function pngAt(size) {
  const data = await sharp(source)
    .resize(size, size, { fit: 'fill' })
    .png()
    .toBuffer()
  return { width: size, height: size, data }
}

const sizes = {
  32: join(root, 'public', 'icon-32.png'),
  48: join(root, 'public', 'icon-48.png'),
  192: join(root, 'public', 'icon-192.png'),
}

const pngs = {}
for (const [size, dest] of Object.entries(sizes)) {
  const img = await pngAt(Number(size))
  pngs[size] = img
  writeFileSync(dest, img.data)
}

copyFileSync(source, join(root, 'public', 'apple-icon.png'))

const ico = pngToIco([await pngAt(16), pngs[32], pngs[48]])
writeFileSync(join(root, 'public', 'favicon.ico'), ico)
writeFileSync(join(root, 'app', 'favicon.ico'), ico)

writeFileSync(join(root, 'public', 'icon.svg'), XLS_ICON_SVG)
writeFileSync(join(root, 'app', 'icon.svg'), XLS_ICON_SVG)

console.log('Wrote XLS Experts favicons (PNG, ICO, SVG, apple-touch).')
