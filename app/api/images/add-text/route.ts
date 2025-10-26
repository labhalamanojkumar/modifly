import sharp from 'sharp'
import { ensureUnderLimit, humanBytes } from '../../../../lib/imageUtils'

export const runtime = 'nodejs'

function createTextSVG(text: string, width: number, height: number, opts: { size?: number; color?: string; x?: number; y?: number; font?: string }) {
  const size = opts.size || 32
  const color = opts.color || '#ffffff'
  const x = opts.x || 0
  const y = opts.y || size
  const font = opts.font || 'Inter, Arial, sans-serif'

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .t { font-family: ${font}; font-size: ${size}px; fill: ${color}; font-weight: 700 }
    </style>
    <text x="${x}" y="${y}" class="t">${text}</text>
  </svg>`
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    const text = String(form.get('text') || '')
    const size = form.get('size') ? Number(form.get('size')) : 40
    const color = String(form.get('color') || '#ffffff')
    const x = form.get('x') ? Number(form.get('x')) : 0
    const y = form.get('y') ? Number(form.get('y')) : 0
    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })

    // Validate upload size early
    try { ensureUnderLimit(file) } catch (err: any) {
      return new Response(JSON.stringify({ error: 'file_too_large', message: err.message }), { status: 413 })
    }

    const inputBuf = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(inputBuf).metadata()
    const w = meta.width || 800
    const h = meta.height || 600
    // If a font file was uploaded, embed it via base64 in the SVG @font-face so the server can render it
    let fontStyle = ''
    let fontSpec = 'Inter, Arial, sans-serif'
    const fontFile = form.get('font') as any
    if (fontFile) {
      const fontBuf = Buffer.from(await fontFile.arrayBuffer())
      const fontMime = fontFile.type || 'font/ttf'
      const fontBase64 = fontBuf.toString('base64')
      const fontName = (fontFile.name || 'uploaded').replace(/[^a-z0-9]/gi, '')
      fontStyle = `@font-face{font-family:'${fontName}'; src: url('data:${fontMime};base64,${fontBase64}');}`
      // prefer the uploaded font in SVG generation
      fontSpec = `'${fontName}', ${fontSpec}`
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">\n  <style>${fontStyle} .t { font-family: ${fontSpec}; font-size: ${size}px; fill: ${color}; font-weight: 700 }</style>\n  <text x="${x}" y="${y || size}" class="t">${text}</text>\n</svg>`

    const svgBuf = Buffer.from(svg)
    const outBuffer = await sharp(inputBuf).composite([{ input: svgBuf, left: 0, top: 0 }]).toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': file.type || 'image/png', 'Content-Disposition': 'attachment; filename="text.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
