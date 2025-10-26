import { describe, it, expect } from 'vitest'
import { ensureUnderLimit, humanBytes, MAX_UPLOAD_BYTES } from '../lib/imageUtils'

describe('imageUtils', () => {
  it('humanBytes formats correctly', () => {
    expect(humanBytes(500)).toBe('500 B')
    expect(humanBytes(2048)).toContain('KB')
    expect(humanBytes(5 * 1024 * 1024)).toContain('MB')
  })

  it('ensureUnderLimit allows small files and throws for large', () => {
    expect(ensureUnderLimit({ size: 100 })).toBe(true)
    const big = MAX_UPLOAD_BYTES + 1
    expect(() => ensureUnderLimit({ size: big, name: 'big.png' })).toThrow(/file_too_large/)
  })
})
