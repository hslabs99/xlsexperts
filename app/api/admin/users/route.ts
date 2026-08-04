import { NextResponse } from 'next/server'
import {
  createUser,
  deleteUser,
  ensureDefaultAdminUser,
  fetchAllUsers,
  updateUser,
} from '@/lib/admin-users-db'
import {
  ADMIN_USER_ROLES,
  type AdminUserInput,
  type AdminUserRole,
  type AdminTabId,
} from '@/lib/admin-users'
import { withTimeout } from '@/lib/with-timeout'

function publicUser(row: Awaited<ReturnType<typeof fetchAllUsers>>[number]) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    allowedTabs: row.allowedTabs,
    active: row.active,
    // Never return password hashes/plaintext to the browser in admin list responses
    // when editing; we'll allow password set on write only. Keep empty string for form compat.
    password: '',
    createdAt: null,
    updatedAt: null,
  }
}

export async function GET() {
  try {
    await withTimeout(ensureDefaultAdminUser(), 8_000, 'ensureDefaultAdminUser')
    const users = await withTimeout(fetchAllUsers(), 10_000, 'fetchAllUsers')
    return NextResponse.json({ ok: true, items: users.map(publicUser) })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load users',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminUserInput
    if (!ADMIN_USER_ROLES.includes(body.role as AdminUserRole)) {
      return NextResponse.json({ ok: false, error: 'Invalid role' }, { status: 400 })
    }
    const id = await withTimeout(createUser(body), 8_000, 'createUser')
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<AdminUserInput> & {
      id?: string
      allowedTabs?: AdminTabId[] | string[]
    }
    const id = body.id?.trim()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }
    const { id: _id, ...fields } = body
    await withTimeout(updateUser(id, fields), 8_000, 'updateUser')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
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
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }
    await withTimeout(deleteUser(id), 8_000, 'deleteUser')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      },
      { status: 500 }
    )
  }
}
