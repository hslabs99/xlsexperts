/**
 * POST /api/contact
 *
 * Standard enquiry: saves to Firestore `enquiries`, then emails via the active
 * standard template (To=client, Cc=business by default).
 */

import { NextResponse } from 'next/server'
import { createEnquiry, updateEnquiryEmailNotified } from '@/lib/enquiries-db'
import { isEmailError } from '@/lib/email/errors'
import {
  buildStandardMergeContext,
  getBusinessEmail,
  sendEnquiryNotificationEmail,
} from '@/lib/email/enquiry-notify'
import { withTimeout } from '@/lib/with-timeout'
import type { ContactPayload } from '@/lib/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateContactPayload(body: ContactPayload): string | null {
  if (!body.name?.trim() || body.name.trim().length > 200) {
    return 'Invalid name.'
  }
  if (!body.email?.trim() || !EMAIL_RE.test(body.email.trim())) {
    return 'Invalid email.'
  }
  if (!body.message?.trim() || body.message.trim().length > 10_000) {
    return 'Invalid message.'
  }
  if (body.company && body.company.length > 200) {
    return 'Invalid company.'
  }
  if (body.phone && body.phone.length > 50) {
    return 'Invalid phone.'
  }
  if (body.hear && body.hear.length > 100) {
    return 'Invalid hear field.'
  }
  if (body.service && body.service.length > 200) {
    return 'Invalid service.'
  }
  if (body.solution && body.solution.length > 200) {
    return 'Invalid solution.'
  }
  if (body.services && (!Array.isArray(body.services) || body.services.length > 20)) {
    return 'Invalid services.'
  }
  return null
}

export async function POST(request: Request) {
  let body: ContactPayload
  try {
    body = (await request.json()) as ContactPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const validationError = validateContactPayload(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  let enquiryId: string | null = null
  try {
    enquiryId = await withTimeout(
      createEnquiry({
        type: 'standard',
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        message: body.message,
        services: body.services,
        service: body.service,
        solution: body.solution,
        hear: body.hear,
        emailNotified: false,
      }),
      8_000,
      'createEnquiry'
    )
  } catch (error) {
    console.error(
      '[contact] Failed to save enquiry to Firestore',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not save enquiry. Please try again.' },
      { status: 500 }
    )
  }

  if (!getBusinessEmail()) {
    console.error('[contact] No CONTACT_NOTIFY_EMAIL or SENDGRID_FROM_EMAIL configured')
    return NextResponse.json(
      { success: true, enquiryId, notified: false },
      { status: 200 }
    )
  }

  try {
    const result = await withTimeout(
      sendEnquiryNotificationEmail({
        kind: 'standard',
        ctx: buildStandardMergeContext(body),
        category: 'contact-enquiry',
        referenceId: enquiryId ? `contact-${enquiryId}` : `contact-${Date.now()}`,
      }),
      15_000,
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
        console.error('[contact] Enquiry saved but failed to mark emailNotified')
      }
    }

    return NextResponse.json(
      { success: true, enquiryId, notified: result.accepted },
      { status: 200 }
    )
  } catch (error) {
    if (isEmailError(error)) {
      console.error('[contact] Enquiry email failed', {
        kind: error.kind,
        statusCode: error.statusCode,
        message: error.message,
        sendGridErrors: error.sendGridErrors,
        enquiryId,
      })
    } else {
      console.error(
        '[contact] Unexpected error sending enquiry email',
        error instanceof Error ? error.message : undefined
      )
    }

    // Enquiry is stored; email failure does not undo the business save
    return NextResponse.json(
      { success: true, enquiryId, notified: false },
      { status: 200 }
    )
  }
}
