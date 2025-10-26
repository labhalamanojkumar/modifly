import { NextResponse } from 'next/server'
import mysqlLib from '../../../../lib/mysql'
import { getAuthFromReq } from '../../../../lib/middleware'

export async function POST(req: Request) {
  try {
    const auth = getAuthFromReq(req)
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    await mysqlLib.initDb()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'init failed', detail: String(err) }, { status: 500 })
  }
}
