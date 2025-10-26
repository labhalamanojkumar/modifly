import sharp from 'sharp'
import { ensureUnderLimit } from '../../../../lib/imageUtils'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const base = form.get('base') as any
    const overlay = form.get('overlay') as any
    if (!base || !overlay) return new Response(JSON.stringify({ error: 'base and overlay files required' }), { status: 400 })

  const left = form.get('left') ? Number(form.get('left')) : 0
  const top = form.get('top') ? Number(form.get('top')) : 0
  // blend mode: over, multiply, screen, etc. sharp supports blend option
  const blend = (form.get('blend') as string) || 'over'
  // opacity for the overlay (0..1). If provided, we'll render the overlay via an SVG wrapper with opacity
  const opacity = form.get('opacity') ? Number(form.get('opacity')) : 1

    // Validate file sizes
    try { ensureUnderLimit(base); ensureUnderLimit(overlay) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const baseBuf = Buffer.from(await base.arrayBuffer())
    const overlayBuf = Buffer.from(await overlay.arrayBuffer())

    let compositeInput: Buffer | { input: Buffer; left?: number; top?: number; blend?: any }
    if (opacity >= 1) {
      compositeInput = { input: overlayBuf, left, top, blend: (blend as any) }
    } else {
      // embed the overlay as a data-uri in an SVG and set opacity there. This keeps the alpha blending precise.
      const mime = (overlay.type as string) || 'image/png'
      const b64 = overlayBuf.toString('base64')
      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg">\n  <image href="data:${mime};base64,${b64}" opacity="${opacity}" />\n</svg>`
      compositeInput = { input: Buffer.from(svg), left, top, blend: (blend as any) }
    }

    const outBuffer = await sharp(baseBuf).composite([compositeInput as any]).toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)
    const contentType = 'image/png'

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': contentType, 'Content-Disposition': 'attachment; filename="overlay.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
