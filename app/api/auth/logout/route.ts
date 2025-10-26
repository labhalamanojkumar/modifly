import { NextResponse } from 'next/server'
import mysqlLib from '../../../../lib/mysql'

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')))
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    const refresh = cookies['refresh_token']
    if (refresh) {
      await mysqlLib.revokeRefreshToken(refresh)
    }
    const res = NextResponse.json({ ok: true })
    // clear cookies
    res.headers.append('Set-Cookie', `access_token=; HttpOnly; Path=/; Max-Age=0;`)
    res.headers.append('Set-Cookie', `refresh_token=; HttpOnly; Path=/; Max-Age=0;`)
    return res
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

