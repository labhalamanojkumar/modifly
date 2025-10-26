import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

import { POST as rotatePOST } from '../app/api/images/rotate/route'
import { POST as enhancePOST } from '../app/api/images/enhance/route'

function loadImageBuffer() {
  const p = path.resolve(__dirname, '..', 'test-image.b64')
  const b64 = fs.readFileSync(p, 'utf8').trim()
  return Buffer.from(b64, 'base64')
}

async function formRequestWithFile(buffer: Buffer, options: Record<string, any> = {}) {
  const fd = new FormData()
  // Buffer isn't recognized as a BlobPart in some TS/lib configs; convert to Uint8Array
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' })
  // @ts-ignore construct File in Node if available
  const file = new File([blob], 'test.png', { type: 'image/png' })
  fd.append('file', file as any)
  for (const k of Object.keys(options)) fd.append(k, String(options[k]))
  return new Request('http://localhost', { method: 'POST', body: fd })
}

describe('image API routes', () => {
  it('rotate route returns image', async () => {
    const buf = loadImageBuffer()
    const req = await formRequestWithFile(buf, { angle: 90 })
    const res = await rotatePOST(req as any)
    const body = await res.arrayBuffer()
    expect(body.byteLength).toBeGreaterThan(0)
    expect(res.status).toBe(200)
  })

  it('enhance route returns image', async () => {
    const buf = loadImageBuffer()
    const req = await formRequestWithFile(buf, { sharpen: 'true', normalize: 'true', quality: 80 })
    const res = await enhancePOST(req as any)
    const body = await res.arrayBuffer()
    expect(body.byteLength).toBeGreaterThan(0)
    expect(res.status).toBe(200)
  })
})
