import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    const format = (form.get('format') as string) || 'png'
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    let img = sharp(input)
    const fmt = format.toLowerCase()
    if (fmt === 'jpeg' || fmt === 'jpg') img = img.jpeg()
    else if (fmt === 'webp') img = img.webp()
    else img = img.png()

    const outBuffer = await img.toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)
    const contentType = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png'

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="converted.${fmt === 'jpeg' ? 'jpg' : fmt}"` } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
