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
    const sparkle = form.get('sparkle') as any
    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })

    try { ensureUnderLimit(file); if (sparkle) ensureUnderLimit(sparkle) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const magick = await findMagick()
    const inputBuf = Buffer.from(await file.arrayBuffer())
    let sparkleBuf: Buffer | undefined
    if (sparkle) sparkleBuf = Buffer.from(await sparkle.arrayBuffer())

    if (!magick) {
      try {
        const outBuf = await import('../../../../../lib/gifJs').then(m => m.jsGlitterGif(inputBuf, sparkleBuf))
        return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="glitter.gif"' } })
      } catch (e) {
        console.error('JS GIF glitter fallback failed', e)
        return new Response(JSON.stringify({ error: 'server_missing_dependency', message: 'ImageMagick not found and JS fallback failed.' }), { status: 501 })
      }
    }

    const tmp = os.tmpdir()
    const inPath = path.join(tmp, `in-${Date.now()}.gif`)
    const sparklePath = path.join(tmp, `sparkle-${Date.now()}.png`)
    const outPath = path.join(tmp, `out-${Date.now()}.gif`)

    await writeFile(inPath, inputBuf)

    if (sparkle) {
      await writeFile(sparklePath, sparkleBuf!)
    } else {
      // generate a small sparkle PNG via SVG
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><g fill='white'><circle cx='32' cy='32' r='6' fill='white' opacity='0.95'/></g></svg>`
      const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer()
      await writeFile(sparklePath, pngBuf)
    }

    // Overlay sparkle centered and tiled: use ImageMagick to tile sparkle across frames
    // Command: magick in.gif -coalesce null: sparkle.png -tile -compose over -layers composite -layers optimize out.gif
    const args = magick === 'magick'
      ? [inPath, '-coalesce', 'null:', sparklePath, '-tile', '-compose', 'over', '-layers', 'composite', '-layers', 'optimize', outPath]
      : [inPath, '-coalesce', 'null:', sparklePath, '-tile', '-compose', 'over', '-layers', 'composite', '-layers', 'optimize', outPath]

    await execFileAsync(magick, args)
    const outBuf = await import('fs').then(fs => fs.promises.readFile(outPath))

    try { await unlink(inPath) } catch (e) {}
    try { await unlink(sparklePath) } catch (e) {}
    try { await unlink(outPath) } catch (e) {}

    return new Response(outBuf as any, { status: 200, headers: { 'Content-Type': 'image/gif', 'Content-Disposition': 'attachment; filename="glitter.gif"' } })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed', detail: String(err && err.message) }), { status: 500 })
  }
}
