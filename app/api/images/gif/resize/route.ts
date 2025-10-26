import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ensureUnderLimit } from '../../../../../lib/imageUtils'
import { jsResizeGif } from '../../../../../lib/gifJs'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'

async function findMagick() {
  // Try ImageMagick (magick) then convert. On Windows, 'magick' is common.
  try {
    await execFileAsync('magick', ['-version'])
    return 'magick'
  } catch (e) {
    try {
      await execFileAsync('convert', ['-version'])
      return 'convert'
    } catch (e2) {
      return null
    }
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })

    try { ensureUnderLimit(file) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const width = form.get('width') ? String(form.get('width')) : null
    const height = form.get('height') ? String(form.get('height')) : null

    const magick = await findMagick()
    const inputBuf = Buffer.from(await file.arrayBuffer())
    if (!magick) {
      // Attempt pure-JS fallback using gifwrap/jimp
      try {
        const w = width ? Number(width) : null
        const h = height ? Number(height) : null
        const outBuf = await jsResizeGif(inputBuf, w, h)
        return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="resized.gif"' } })
      } catch (e) {
        console.error('JS GIF fallback failed', e)
        return new Response(JSON.stringify({ error: 'server_missing_dependency', message: 'ImageMagick not found and JS fallback failed.' }), { status: 501 })
      }
    }
    const tmpDir = await os.tmpdir()
    const inPath = path.join(tmpDir, `in-${Date.now()}.gif`)
    const outPath = path.join(tmpDir, `out-${Date.now()}.gif`)
    await writeFile(inPath, inputBuf)

    // Build resize geometry
    let geom = ''
    if (width && height) geom = `${width}x${height}`
    else if (width) geom = `${width}`
    else if (height) geom = `x${height}`

    // Command: magick in.gif -coalesce -resize {geom} -layers optimize out.gif
    const args = magick === 'magick'
      ? [inPath, '-coalesce', '-resize', geom || '', '-layers', 'optimize', outPath].filter(Boolean)
      : [inPath, '-coalesce', '-resize', geom || '', '-layers', 'optimize', outPath].filter(Boolean)

  await execFileAsync(magick, args)
    const outBuf = await import('fs').then(fs => fs.promises.readFile(outPath))

    // cleanup
    try { await unlink(inPath) } catch (e) {}
    try { await unlink(outPath) } catch (e) {}

    return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="resized.gif"' } })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed', detail: String(err && err.message) }), { status: 500 })
  }
}
