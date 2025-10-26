import { NextResponse } from 'next/server'
import getDb from '../../../lib/db'
import mysqlLib from '../../../lib/mysql'

export async function GET() {
  try {
    const result = await mysqlLib.getAnalytics()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'failed to read analytics' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    await mysqlLib.postEvent(body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'failed to write analytics' }, { status: 500 })
  }
}
