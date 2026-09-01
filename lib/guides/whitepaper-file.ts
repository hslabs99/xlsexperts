import 'server-only'

import { NextResponse } from 'next/server'
import {
  emailAttachmentFilename,
  emailAttachmentPublicPath,
  hasEmailAttachment,
} from '@/lib/email-templates'
import { fetchEmailTemplateById } from '@/lib/email-templates-db'
import { downloadStorageObject } from '@/lib/storage-admin'
import { withTimeout } from '@/lib/with-timeout'

const NOINDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
} as const

function pdfResponse(buffer: Buffer, filename: string, etag: string) {
  const safe = filename.replace(/["\\\r\n]/g, '_') || 'white-paper.pdf'
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      ...NOINDEX_HEADERS,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safe}"`,
      ETag: `"${etag.replace(/"/g, '')}"`,
    },
  })
}

/** Stream the PDF stored on an email template. URL filename is the uploaded name. */
export async function serveEmailTemplatePdf(
  templateId: string,
  filenameFromUrl: string,
  requestUrl: string
): Promise<NextResponse> {
  const template = await fetchEmailTemplateById(templateId)
  if (!template || !hasEmailAttachment(template)) {
    return NextResponse.json(
      { error: 'The file is not available.' },
      { status: 404, headers: NOINDEX_HEADERS }
    )
  }

  const currentName = emailAttachmentFilename(template)
  const requested = decodeURIComponent(filenameFromUrl).trim()
  if (currentName && requested && requested !== currentName) {
    const canonical = emailAttachmentPublicPath(template.id, currentName)
    return NextResponse.redirect(new URL(canonical, requestUrl), 302)
  }

  try {
    const file = await withTimeout(
      downloadStorageObject(template.attachmentStoragePath),
      20_000,
      'downloadStorageObject'
    )
    if (!file) {
      return NextResponse.json(
        { error: 'The file is not available.' },
        { status: 404, headers: NOINDEX_HEADERS }
      )
    }
    return pdfResponse(
      file.buffer,
      currentName || requested || 'white-paper.pdf',
      template.attachmentStoragePath
    )
  } catch {
    return NextResponse.json(
      { error: 'Could not load the file.' },
      { status: 500, headers: NOINDEX_HEADERS }
    )
  }
}
