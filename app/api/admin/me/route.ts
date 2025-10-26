import { NextResponse } from 'next/server'
import { getAuthFromRequestCookies } from '../../../../lib/middleware'

export async function GET(req: Request) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, user: auth })
}
