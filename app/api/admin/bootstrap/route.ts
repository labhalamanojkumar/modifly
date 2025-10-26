import { NextResponse } from 'next/server'
import mysqlLib from '../../../../lib/mysql'
import { hashPassword } from '../../../../lib/password'

export async function POST(req: Request) {
  // safety: only allow bootstrap in non-production by default
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'disabled_in_production' }, { status: 403 })
  }
  const adminUser = process.env.ADMIN_USER
  const adminPass = process.env.ADMIN_PASS
  if (!adminUser || !adminPass) {
    return NextResponse.json({ ok: false, error: 'env_missing' }, { status: 400 })
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: 'no_database' }, { status: 400 })
  }
  try {
    const hashed = hashPassword(adminPass)
    await mysqlLib.createAdminUser(adminUser, hashed)
    return NextResponse.json({ ok: true, user: adminUser })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'failed', detail: String(e) }, { status: 500 })
  }
}
