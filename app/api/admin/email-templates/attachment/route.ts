import { NextResponse } from 'next/server'
import { fetchEmailTemplateById, updateEmailTemplate } from '@/lib/email-templates-db'
import { uploadEmailPdfAttachmentAdmin } from '@/lib/storage-admin'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const id = String(form.get('id') || '').trim()
    const file = form.get('file')
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Save the template first, then upload the PDF.' },
        { status: 400 }
      )
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { ok: false, error: 'Choose a PDF to upload.' },
        { status: 400 }
      )
    }
    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json(
        { ok: false, error: 'Attachment must be a PDF.' },
        { status: 400 }
      )
    }

    const existing = await withTimeout(
      fetchEmailTemplateById(id),
      8_000,
      'fetchEmailTemplateById'
    )
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: 'Template not found.' },
        { status: 404 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await withTimeout(
      uploadEmailPdfAttachmentAdmin(id, buffer, file.name || 'white-paper.pdf'),
      20_000,
      'uploadEmailPdfAttachmentAdmin'
    )

    await withTimeout(
      updateEmailTemplate(id, {
        attachmentFilename: uploaded.filename,
        attachmentStoragePath: uploaded.storagePath,
        attachmentUrl: uploaded.url,
        attachmentContentType: uploaded.contentType,
      }),
      8_000,
      'updateEmailTemplate'
    )

    return NextResponse.json({
      ok: true,
      attachmentFilename: uploaded.filename,
      attachmentStoragePath: uploaded.storagePath,
      attachmentUrl: uploaded.url,
      attachmentContentType: uploaded.contentType,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload PDF attachment',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    await withTimeout(
      updateEmailTemplate(id, {
        attachmentFilename: '',
        attachmentStoragePath: '',
        attachmentUrl: '',
        attachmentContentType: '',
      }),
      8_000,
      'updateEmailTemplate'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove PDF attachment',
      },
      { status: 500 }
    )
  }
}
