import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getAuthFromReq(req: NextRequest | Request) {
  let auth: string | null = null
  // handle both NextRequest (server) and regular Request
  // @ts-ignore
  const headers = req.headers || (req as any).headers
  if (headers) {
    if (typeof (headers as any).get === 'function') {
      auth = (headers as any).get('authorization')
    } else {
      // plain object
      auth = (headers as any)['authorization'] || (headers as any)['Authorization'] || null
    }
  }
  if (!auth) return null
  const m = auth.match(/^Bearer (.+)$/i)
  if (!m) return null
  const token = m[1]
  return verifyToken(token)
}

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')))
}

export function getAuthFromRequestCookies(req: NextRequest | Request) {
  // first try header-based auth
  const headerAuth = getAuthFromReq(req as any)
  if (headerAuth) return headerAuth
  // fallback to access_token cookie
  // @ts-ignore
  const headers = req.headers || (req as any).headers
  let cookieHeader: string | null = null
  if (headers) {
    if (typeof (headers as any).get === 'function') {
      cookieHeader = (headers as any).get('cookie')
    } else {
      cookieHeader = (headers as any)['cookie'] || null
    }
  }
  const cookies = parseCookies(cookieHeader)
  const access = cookies['access_token']
  if (!access) return null
  return verifyToken(access)
}

const middleware = { getAuthFromReq }

export default middleware
