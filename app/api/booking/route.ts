/**
 * POST /api/booking
 *
 * Discovery booking: saves to Firestore `enquiries`, then emails via the
 * active discovery template.
 */

import { NextResponse } from 'next/server'
import { createEnquiry, updateEnquiryEmailNotified } from '@/lib/enquiries-db'
import { isEmailError } from '@/lib/email/errors'
import {
  buildDiscoveryMergeContext,
  getBusinessEmail,
  sendEnquiryNotificationEmail,
} from '@/lib/email/enquiry-notify'
import type { BookingPayload } from '@/lib/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: BookingPayload
  try {
    body = (await request.json()) as BookingPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (
    !body.name?.trim() ||
    !body.email?.trim() ||
    !EMAIL_RE.test(body.email.trim()) ||
    !body.phone?.trim() ||
    !body.day?.trim() ||
    !body.date?.trim() ||
    !body.time?.trim() ||
    !body.method?.trim() ||
    !body.slotId?.trim()
  ) {
    return NextResponse.json({ error: 'Missing required booking fields.' }, { status: 400 })
  }

  let enquiryId: string | null = null
  try {
    enquiryId = await createEnquiry({
      type: 'discovery',
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone,
      message: body.message,
      services: body.services,
      hear: body.hear,
      day: body.day,
      date: body.date,
      time: body.time,
      method: body.method,
      slotId: body.slotId,
      emailNotified: false,
    })
  } catch (error) {
    console.error(
      '[booking] Failed to save enquiry to Firestore',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not save booking enquiry. Please try again.' },
      { status: 500 }
    )
  }

  if (!getBusinessEmail()) {
    console.error('[booking] No CONTACT_NOTIFY_EMAIL or SENDGRID_FROM_EMAIL configured')
    return NextResponse.json(
      { success: true, enquiryId, notified: false },
      { status: 200 }
    )
  }

  try {
    const result = await sendEnquiryNotificationEmail({
      kind: 'discovery',
      ctx: buildDiscoveryMergeContext(body),
      category: 'discovery-booking',
      referenceId: enquiryId
        ? `booking-${enquiryId}`
        : `booking-${body.slotId}-${Date.now()}`,
    })

    if (enquiryId && result.accepted) {
      try {
        await updateEnquiryEmailNotified(enquiryId, true)
      } catch {
        console.error('[booking] Enquiry saved but failed to mark emailNotified')
      }
    }

    return NextResponse.json(
      { success: true, enquiryId, notified: result.accepted },
      { status: 200 }
    )
  } catch (error) {
    if (isEmailError(error)) {
      console.error('[booking] Discovery email failed', {
        kind: error.kind,
        statusCode: error.statusCode,
        message: error.message,
        sendGridErrors: error.sendGridErrors,
        enquiryId,
      })
    } else {
      console.error(
        '[booking] Unexpected error sending discovery email',
        error instanceof Error ? error.message : undefined
      )
    }

    return NextResponse.json(
      { success: true, enquiryId, notified: false },
      { status: 200 }
    )
  }
}
