import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import sharp from 'sharp'
import { ensureUnderLimit } from '../../../../../lib/imageUtils'
import { jsOverlayGif } from '../../../../../lib/gifJs'

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
    const overlay = form.get('overlay') as any
    if (!file || !overlay) return new Response(JSON.stringify({ error: 'file and overlay required' }), { status: 400 })

    try { ensureUnderLimit(file); ensureUnderLimit(overlay) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const left = form.get('left') ? Number(form.get('left')) : 0
    const top = form.get('top') ? Number(form.get('top')) : 0
    const opacity = form.get('opacity') ? Number(form.get('opacity')) : 1

    const magick = await findMagick()
    const inputBuf = Buffer.from(await file.arrayBuffer())
    const overlayBuf = Buffer.from(await overlay.arrayBuffer())
    if (!magick) {
      // try pure-JS fallback
      try {
        const outBuf = await jsOverlayGif(inputBuf, overlayBuf, left, top, opacity)
        return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="overlayed.gif"' } })
      } catch (e) {
        console.error('JS GIF overlay fallback failed', e)
        return new Response(JSON.stringify({ error: 'server_missing_dependency', message: 'ImageMagick not found and JS fallback failed.' }), { status: 501 })
      }
    }
    const tmp = os.tmpdir()
    const inPath = path.join(tmp, `in-${Date.now()}.gif`)
    const overlayPath = path.join(tmp, `overlay-${Date.now()}.png`)
    const outPath = path.join(tmp, `out-${Date.now()}.gif`)

    await writeFile(inPath, inputBuf)

    // If opacity < 1, wrap overlay in an SVG to set global opacity, then render PNG via sharp
    if (opacity >= 1) {
      // write raw overlay to PNG path
      await writeFile(overlayPath, overlayBuf)
    } else {
      const meta = await sharp(overlayBuf).metadata()
      const w = meta.width || 200
      const h = meta.height || 200
      const mime = (overlay.type as string) || 'image/png'
      const b64 = overlayBuf.toString('base64')
      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>\n  <image href='data:${mime};base64,${b64}' opacity='${opacity}' width='${w}' height='${h}' />\n</svg>`
      const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer()
      await writeFile(overlayPath, pngBuf)
    }

    // Compose overlay across frames using ImageMagick. Use -coalesce then -layers composite.
    // Position using -geometry +left+top and gravity northwest.
    const args = magick === 'magick'
      ? [inPath, '-coalesce', 'null:', overlayPath, '-gravity', 'northwest', '-geometry', `+${left}+${top}`, '-layers', 'composite', '-layers', 'optimize', outPath]
      : [inPath, '-coalesce', 'null:', overlayPath, '-gravity', 'northwest', '-geometry', `+${left}+${top}`, '-layers', 'composite', '-layers', 'optimize', outPath]

    await execFileAsync(magick, args)

    const outBuf = await import('fs').then(fs => fs.promises.readFile(outPath))

    // cleanup
    try { await unlink(inPath) } catch (e) {}
    try { await unlink(overlayPath) } catch (e) {}
    try { await unlink(outPath) } catch (e) {}

    return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="overlayed.gif"' } })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed', detail: String(err && err.message) }), { status: 500 })
  }
}
