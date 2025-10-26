import { NextResponse } from 'next/server'
import mysqlLib from '../../../../lib/mysql'
import { signToken } from '../../../../lib/auth'
import crypto from 'crypto'

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')))
}

function createCookieHeader(name: string, value: string, maxAgeSec: number) {
  const secure = process.env.NODE_ENV === 'production'
  return `${name}=${value}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; ${secure ? 'Secure; SameSite=Strict;' : ''}`
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    const refresh = cookies['refresh_token']
    if (!refresh) return NextResponse.json({ ok: false, error: 'no_refresh' }, { status: 401 })

    const row: any = await mysqlLib.findRefreshToken(refresh)
    if (!row) return NextResponse.json({ ok: false, error: 'invalid_refresh' }, { status: 401 })
    const expires = new Date(row.expires_at).getTime()
    if (Date.now() > expires) {
      await mysqlLib.revokeRefreshToken(refresh)
      return NextResponse.json({ ok: false, error: 'expired' }, { status: 401 })
    }

    // rotate
    const newRefresh = crypto.randomBytes(48).toString('hex')
    const refreshExpires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toISOString()
    await mysqlLib.revokeRefreshToken(refresh)
    await mysqlLib.storeRefreshToken(newRefresh, row.username, refreshExpires)

    const accessToken = signToken({ user: row.username }, { expiresIn: '15m' })

    const res = NextResponse.json({ ok: true })
    res.headers.append('Set-Cookie', createCookieHeader('access_token', accessToken, 60 * 15))
    res.headers.append('Set-Cookie', createCookieHeader('refresh_token', newRefresh, 60 * 60 * 24 * 30))
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}

