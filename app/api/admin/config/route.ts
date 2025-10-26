import { NextResponse } from 'next/server'
import mysqlLib from '../../../../lib/mysql'
import { getAuthFromRequestCookies } from '../../../../lib/middleware'

export async function POST(req: Request) {
  try {
  const auth = getAuthFromRequestCookies(req)
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const body = await req.json()
    const updated = await mysqlLib.setAdminConfig(body.ga, body.adsense)
    return NextResponse.json({ ok: true, config: updated })
  } catch (err) {
    return NextResponse.json({ error: 'failed to write admin config' }, { status: 500 })
  }
}
export async function GET(req: Request) {
  try {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const row = await mysqlLib.getAdminConfig()
    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: 'failed to read admin config' }, { status: 500 })
  }
}
