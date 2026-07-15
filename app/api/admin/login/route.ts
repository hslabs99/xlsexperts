import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/admin-users-db'
import type { AdminSession } from '@/lib/admin-users'
import { withTimeout } from '@/lib/with-timeout'

/**
 * POST /api/admin/login
 * Authenticates against Firestore on the server (avoids flaky browser Firestore
 * on App Hosting) and returns a session payload for sessionStorage.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = (await request.json()) as { email?: string; password?: string }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const email = body.email?.trim() ?? ''
  const password = body.password ?? ''
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: 'Email and password are required.' },
      { status: 400 }
    )
  }

  try {
    // authenticateUser also ensures the default admin exists when the collection is empty.
    const user = await withTimeout(
      authenticateUser(email, password),
      12_000,
      'authenticateUser'
    )
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const session: AdminSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    return NextResponse.json({ ok: true, session })
  } catch (error) {
    console.error(
      '[admin/login] Failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Login failed. Please try again.',
      },
      { status: 500 }
    )
  }
}
