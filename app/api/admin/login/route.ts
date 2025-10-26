import { NextResponse } from 'next/server'
import mysqlLib from '../../../../lib/mysql'
import { signToken } from '../../../../lib/auth'
import crypto from 'crypto'
import { hashPassword, verifyPassword } from '../../../../lib/password'

function createCookieHeader(name: string, value: string, maxAgeSec: number) {
  const secure = process.env.NODE_ENV === 'production'
  return `${name}=${value}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; ${secure ? 'Secure; SameSite=Strict;' : ''}`
}

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'password'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    // If no DATABASE_URL is configured, fall back to env-based login
    if (!process.env.DATABASE_URL) {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        const accessToken = signToken({ user: username }, { expiresIn: '15m' })
        const refreshToken = crypto.randomBytes(48).toString('hex')
        const res = NextResponse.json({ ok: true })
        res.headers.append('Set-Cookie', createCookieHeader('access_token', accessToken, 60 * 15))
        res.headers.append('Set-Cookie', createCookieHeader('refresh_token', refreshToken, 60 * 60 * 24 * 30))
        return res
      }
      return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 })
    }

    // ensure admin user exists in DB; bootstrap from env if not
    let dbUser = await mysqlLib.getAdminUser(username)
    if (!dbUser) {
      // if requested username matches the ADMIN_USER and ADMIN_PASS env, create it
      if (username === ADMIN_USER && ADMIN_PASS) {
        const hashed = hashPassword(ADMIN_PASS)
        await mysqlLib.createAdminUser(username, hashed)
        dbUser = await mysqlLib.getAdminUser(username)
      }
    }

    // If a DB user exists but has no password_hash, allow bootstrapping from env
    if (dbUser && !dbUser.password_hash && username === ADMIN_USER && ADMIN_PASS && password === ADMIN_PASS) {
      const hashed = hashPassword(ADMIN_PASS)
      try {
        await mysqlLib.updateAdminUserPassword(username, hashed)
        dbUser.password_hash = hashed
        // eslint-disable-next-line no-console
        console.log(`Patched empty password_hash for admin user ${username}`)
      } catch (e) {
        // ignore
      }
    }

    if (!dbUser) return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 })

    // verify password
    const ok = verifyPassword(password, dbUser.password_hash)
    if (!ok) {
      // eslint-disable-next-line no-console
      console.warn('Admin login failed for user', username, 'password_hash_exists=', !!dbUser.password_hash)
      return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 })
    }

    // create access token (short-lived) and refresh token (long-lived)
    const accessToken = signToken({ user: username }, { expiresIn: '15m' })
    const refreshToken = crypto.randomBytes(48).toString('hex')
    const refreshExpires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toISOString() // 30 days
    await mysqlLib.storeRefreshToken(refreshToken, username, refreshExpires)
    try { await mysqlLib.postEvent({ type: 'admin-login', payload: { user: username } }) } catch (e) { /* ignore analytics failures */ }

    const res = NextResponse.json({ ok: true })
    // set cookies
    res.headers.append('Set-Cookie', createCookieHeader('access_token', accessToken, 60 * 15))
    res.headers.append('Set-Cookie', createCookieHeader('refresh_token', refreshToken, 60 * 60 * 24 * 30))
    return res
    return NextResponse.json({ ok: false }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: 'login failed' }, { status: 500 })
  }
}
