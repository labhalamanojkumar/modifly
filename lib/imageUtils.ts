export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

export function ensureUnderLimit(file: { size?: number; name?: string }, max = MAX_UPLOAD_BYTES) {
  const size = typeof file.size === 'number' ? file.size : undefined
  if (typeof size === 'number' && size > max) {
    const name = file.name || 'file'
    throw new Error(`file_too_large: ${name} (${size} bytes) > ${max} bytes`)
  }
  return true
}

export function humanBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
