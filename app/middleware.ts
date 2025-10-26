import { NextRequest, NextResponse } from 'next/server'
import { MAX_UPLOAD_BYTES } from '../lib/imageUtils'

export function middleware(req: NextRequest) {
  const cl = req.headers.get('content-length')
  if (cl) {
    const n = Number(cl)
    if (!Number.isNaN(n) && n > MAX_UPLOAD_BYTES) {
      return new NextResponse(JSON.stringify({ error: 'request_too_large', message: `Content-Length ${n} exceeds ${MAX_UPLOAD_BYTES}` }), { status: 413, headers: { 'content-type': 'application/json' } })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
