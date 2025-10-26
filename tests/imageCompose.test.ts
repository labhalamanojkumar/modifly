import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { composeImage } from '../lib/imageCompose'

function loadTestImageBuffer() {
  const p = path.resolve(__dirname, '..', 'test-image.b64')
  const b64 = fs.readFileSync(p, 'utf8').trim()
  return Buffer.from(b64, 'base64')
}

describe('image compose helper', () => {
  it('applies rotate and enhance and returns a buffer', async () => {
    const buf = loadTestImageBuffer()
    const out = await composeImage(buf, [
      { op: 'rotate', args: { angle: 90 } },
      { op: 'enhance', args: { normalize: true, sharpen: true, quality: 80 } },
    ])
    expect(out).toBeInstanceOf(Buffer)
    expect(out.length).toBeGreaterThan(0)
  })

  it('supports resize and crop ops', async () => {
    const buf = loadTestImageBuffer()
    const out = await composeImage(buf, [
      { op: 'resize', args: { width: 10, height: 10 } },
      { op: 'crop', args: { left: 0, top: 0, width: 5, height: 5 } },
    ])
    expect(out).toBeInstanceOf(Buffer)
    expect(out.length).toBeGreaterThan(0)
  })
})
