/**
 * POST /api/booking
 *
 * Receives a discovery call booking and returns 200.
 *
 * TO WIRE UP IN CURSOR — choose one:
 *
 *   Option A — Microsoft Graph API (creates a real Teams calendar event):
 *     1. Register an app in Azure Active Directory
 *     2. Grant: Calendars.ReadWrite, OnlineMeetings.ReadWrite
 *     3. Env vars: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_USER_ID
 *     4. POST to: https://graph.microsoft.com/v1.0/users/{AZURE_USER_ID}/events
 *
 *   Option B — Microsoft Bookings API (uses your existing Bookings calendar):
 *     1. Same Azure app registration as above
 *     2. Additional scope: Bookings.ReadWrite.All
 *     3. POST to: https://graph.microsoft.com/v1.0/solutions/bookingBusinesses/{id}/appointments
 *
 *   Option C — Cal.com REST API (simpler, no Azure required):
 *     Env vars: CALCOM_API_KEY, CALCOM_EVENT_TYPE_ID
 *     POST to: https://api.cal.com/v1/bookings
 *
 *   In all cases, also post a Teams channel notification (see /api/contact for the pattern).
 */

import { NextResponse } from 'next/server'
import type { BookingPayload } from '@/lib/types'

export async function POST(request: Request) {
  const body: BookingPayload = await request.json()

  // Basic server-side validation
  if (!body.name || !body.email || !body.phone || !body.day || !body.time || !body.method) {
    return NextResponse.json({ error: 'Missing required booking fields.' }, { status: 400 })
  }

  // --- INTEGRATION POINT ---
  // Example Microsoft Graph calendar event (uncomment in Cursor):
  //
  // const tokenRes = await fetch(
  //   `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
  //   {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     body: new URLSearchParams({
  //       grant_type: 'client_credentials',
  //       client_id: process.env.AZURE_CLIENT_ID!,
  //       client_secret: process.env.AZURE_CLIENT_SECRET!,
  //       scope: 'https://graph.microsoft.com/.default',
  //     }),
  //   }
  // )
  // const { access_token } = await tokenRes.json()
  //
  // await fetch(`https://graph.microsoft.com/v1.0/users/${process.env.AZURE_USER_ID}/events`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     subject: `Discovery Call — ${body.name}`,
  //     body: { contentType: 'text', content: body.message },
  //     start: { dateTime: '/* derive ISO from body.day + body.time */', timeZone: 'New Zealand Standard Time' },
  //     end:   { dateTime: '/* +30 min */', timeZone: 'New Zealand Standard Time' },
  //     attendees: [{ emailAddress: { address: body.email, name: body.name }, type: 'required' }],
  //     isOnlineMeeting: body.method === 'Microsoft Teams',
  //     onlineMeetingProvider: body.method === 'Microsoft Teams' ? 'teamsForBusiness' : undefined,
  //   }),
  // })
  // --- END INTEGRATION POINT ---

  return NextResponse.json({ success: true }, { status: 200 })
}
