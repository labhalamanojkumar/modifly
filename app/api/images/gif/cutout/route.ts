import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
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
    const mask = form.get('mask') as any
    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })

    try { ensureUnderLimit(file); if (mask) ensureUnderLimit(mask) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const magick = await findMagick()
    const inputBuf = Buffer.from(await file.arrayBuffer())
    if (!mask) {
      return new Response(JSON.stringify({ error: 'mask_required', message: 'Provide a mask image (white area kept, black area removed).' }), { status: 400 })
    }
    const maskBuf = Buffer.from(await mask.arrayBuffer())

    if (!magick) {
      try {
        const outBuf = await import('../../../../../lib/gifJs').then(m => m.jsCutoutGif(inputBuf, maskBuf))
        return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="cutout.gif"' } })
      } catch (e) {
        console.error('JS GIF cutout fallback failed', e)
        return new Response(JSON.stringify({ error: 'server_missing_dependency', message: 'ImageMagick not found and JS fallback failed.' }), { status: 501 })
      }
    }

    const tmp = os.tmpdir()
    const inPath = path.join(tmp, `in-${Date.now()}.gif`)
    const maskPath = path.join(tmp, `mask-${Date.now()}.png`)
    const outPath = path.join(tmp, `out-${Date.now()}.gif`)

    await writeFile(inPath, inputBuf)
    await writeFile(maskPath, maskBuf)

    // Apply mask using ImageMagick: coalesce frames, apply mask as alpha (DstIn), optimize
    const args = magick === 'magick'
      ? [inPath, '-coalesce', 'null:', maskPath, '-alpha', 'set', '-compose', 'DstIn', '-composite', '-layers', 'optimize', outPath]
      : [inPath, '-coalesce', 'null:', maskPath, '-alpha', 'set', '-compose', 'DstIn', '-composite', '-layers', 'optimize', outPath]

    await execFileAsync(magick, args)
    const outBuf = await import('fs').then(fs => fs.promises.readFile(outPath))

    try { await unlink(inPath) } catch (e) {}
    try { await unlink(maskPath) } catch (e) {}
    try { await unlink(outPath) } catch (e) {}

    return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="cutout.gif"' } })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed', detail: String(err && err.message) }), { status: 500 })
  }
}
