import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import sharp from 'sharp'
import { ensureUnderLimit } from '../../../../../lib/imageUtils'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'

async function findMagick() {
  try { await execFileAsync('magick', ['-version']); return 'magick' } catch (e) {}
  try { await execFileAsync('convert', ['-version']); return 'convert' } catch (e) {}
  return null
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    const text = String(form.get('text') || '')
    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })

    try { ensureUnderLimit(file) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const size = form.get('size') ? Number(form.get('size')) : 40
    const color = String(form.get('color') || '#ffffff')
    const x = form.get('x') ? Number(form.get('x')) : 0
    const y = form.get('y') ? Number(form.get('y')) : 0

    const magick = await findMagick()
    const inputBuf = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(inputBuf).metadata()
    if (!magick) {
      // pure-JS fallback
      try {
        const outBuf = await import('../../../../../lib/gifJs').then(m => m.jsAddTextGif(inputBuf, text, { size, color: '#ffffff', x, y }))
        return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="texted.gif"' } })
      } catch (e) {
        console.error('JS GIF add-text fallback failed', e)
        return new Response(JSON.stringify({ error: 'server_missing_dependency', message: 'ImageMagick not found and JS fallback failed.' }), { status: 501 })
      }
    }
    const w = meta.width || 800
    const h = meta.height || 600

    const tmp = os.tmpdir()
    const inPath = path.join(tmp, `in-${Date.now()}.gif`)
    const textOverlayPath = path.join(tmp, `text-${Date.now()}.png`)
    const outPath = path.join(tmp, `out-${Date.now()}.gif`)

    await writeFile(inPath, inputBuf)

    // Create an SVG with the requested text and render to PNG via sharp
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">\n  <style> .t { font-size: ${size}px; fill: ${color}; font-weight:700; font-family: Inter, Arial, sans-serif } </style>\n  <text x="${x}" y="${y || size}" class="t">${escapeXml(text)}</text>\n</svg>`
    const textPng = await sharp(Buffer.from(svg)).png().toBuffer()
    await writeFile(textOverlayPath, textPng)

    const args = magick === 'magick'
      ? [inPath, '-coalesce', 'null:', textOverlayPath, '-gravity', 'northwest', '-geometry', `+0+0`, '-layers', 'composite', '-layers', 'optimize', outPath]
      : [inPath, '-coalesce', 'null:', textOverlayPath, '-gravity', 'northwest', '-geometry', `+0+0`, '-layers', 'composite', '-layers', 'optimize', outPath]

    await execFileAsync(magick, args)
    const outBuf = await import('fs').then(fs => fs.promises.readFile(outPath))

    try { await unlink(inPath) } catch (e) {}
    try { await unlink(textOverlayPath) } catch (e) {}
    try { await unlink(outPath) } catch (e) {}

    return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="texted.gif"' } })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed', detail: String(err && err.message) }), { status: 500 })
  }
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
