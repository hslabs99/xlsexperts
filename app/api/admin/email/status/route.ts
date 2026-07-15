/**
 * GET /api/admin/email/status
 *
 * Returns a safe SendGrid configuration snapshot for the admin Email tab.
 * Never includes the raw API key.
 */

import { NextResponse } from 'next/server'
import { getEmailConfigSnapshot } from '@/lib/email/diagnostics'

export async function GET() {
  const config = getEmailConfigSnapshot()
  return NextResponse.json({
    ok: config.ready,
    checkedAt: new Date().toISOString(),
    config,
  })
}
