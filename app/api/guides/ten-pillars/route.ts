import { NextResponse } from 'next/server'
import { isEmailError } from '@/lib/email/errors'
import {
  buildWhitepaperMergeContext,
  getBusinessEmail,
  sendEnquiryNotificationEmail,
} from '@/lib/email/enquiry-notify'
import { emailAttachmentFilename, hasEmailAttachment, simpleDownloadLabel } from '@/lib/email-templates'
import { fetchActiveEmailTemplate } from '@/lib/email-templates-db'
import { createEnquiry, updateEnquiryEmailNotified } from '@/lib/enquiries-db'
import { parseMailingRegion } from '@/lib/mailings'
import { upsertProspectFromLead } from '@/lib/mailings-db'
import { getMarketStamp } from '@/lib/market-server'
import { TEN_PILLARS_GUIDE } from '@/lib/quoting-pillars'
import { withTimeout } from '@/lib/with-timeout'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Old website-path links → the live Firebase Storage file. */
export async function GET() {
  const template = await fetchActiveEmailTemplate('whitepaper').catch(() => null)
  const url = template?.attachmentUrl?.trim()
  if (!template || !hasEmailAttachment(template) || !url) {
    return NextResponse.json(
      { error: 'The file is not available.' },
      { status: 404 }
    )
  }
  return NextResponse.redirect(url, 302)
}

export async function POST(request: Request) {
  let body: {
    email?: string
    name?: string
    company?: string
    companyWebsite?: string
    sourcePath?: string
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (body.companyWebsite?.trim()) {
    return NextResponse.json({ ok: true })
  }

  const name = body.name?.trim() || ''
  const company = body.company?.trim() || ''
  const email = body.email?.trim() || ''
  if (!name || name.length > 200) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!company || company.length > 200) {
    return NextResponse.json(
      { error: 'Please enter your company name.' },
      { status: 400 }
    )
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    )
  }

  const { market, host } = await getMarketStamp()
  const sourcePath = body.sourcePath?.trim() || TEN_PILLARS_GUIDE.pagePath
  const about = `Requested white paper: ${TEN_PILLARS_GUIDE.title} (${sourcePath})`

  let enquiryId: string | null = null
  try {
    enquiryId = await withTimeout(
      createEnquiry({
        type: 'whitepaper',
        name,
        company,
        email,
        message: about,
        solution: 'Quoting & Estimating Systems',
        market,
        host,
      }),
      8_000,
      'createEnquiry'
    )
  } catch (error) {
    console.error(
      '[guides/ten-pillars] Failed to save white paper enquiry',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not save your request. Please try again.' },
      { status: 500 }
    )
  }

  try {
    await withTimeout(
      upsertProspectFromLead({
        name,
        email,
        company,
        source: 'guide',
        sector: 'Quoting & Estimating Systems',
        region: parseMailingRegion(market),
        notes: about,
        campaignTag: 'ten-pillars-guide',
      }),
      8_000,
      'upsertProspectFromLead'
    )
  } catch (error) {
    console.error(
      '[guides/ten-pillars] mailing contact upsert failed',
      error instanceof Error ? error.message : undefined
    )
  }

  const template = await withTimeout(
    fetchActiveEmailTemplate('whitepaper'),
    8_000,
    'fetchActiveEmailTemplate(whitepaper)'
  ).catch(() => null)

  const publicDownloadUrl = template?.attachmentUrl?.trim() || ''
  if (!template || !hasEmailAttachment(template) || !publicDownloadUrl) {
    return NextResponse.json(
      {
        error:
          'The guide is not available to send yet. Your details have been saved and we will send it directly.',
      },
      { status: 503 }
    )
  }

  const filename = emailAttachmentFilename(template)
  const downloadPath = publicDownloadUrl

  if (!getBusinessEmail()) {
    return NextResponse.json({
      ok: true,
      enquiryId,
      notified: false,
      downloadUrl: downloadPath,
      filename,
    })
  }

  try {
    const result = await withTimeout(
      sendEnquiryNotificationEmail({
        kind: 'whitepaper',
        templateId: template.id,
        ctx: buildWhitepaperMergeContext({
          name,
          email,
          company,
          downloadUrl: publicDownloadUrl,
          downloadLabel: simpleDownloadLabel(filename),
          about,
        }),
        category: 'whitepaper-guide',
        referenceId: enquiryId ? `whitepaper-${enquiryId}` : undefined,
      }),
      20_000,
      'sendEnquiryNotificationEmail'
    )

    if (enquiryId && result.accepted) {
      try {
        await withTimeout(
          updateEnquiryEmailNotified(enquiryId, true),
          5_000,
          'updateEnquiryEmailNotified'
        )
      } catch {
        console.error('[guides/ten-pillars] failed to mark emailNotified')
      }
    }

    return NextResponse.json({
      ok: true,
      enquiryId,
      notified: result.accepted,
      downloadUrl: downloadPath,
      filename,
    })
  } catch (error) {
    if (isEmailError(error)) {
      console.error('[guides/ten-pillars] email failed', {
        kind: error.kind,
        statusCode: error.statusCode,
        message: error.message,
      })
    } else {
      console.error(
        '[guides/ten-pillars] unexpected email error',
        error instanceof Error ? error.message : undefined
      )
    }
    return NextResponse.json({
      ok: true,
      enquiryId,
      notified: false,
      downloadUrl: downloadPath,
      filename,
    })
  }
}
