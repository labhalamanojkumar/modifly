import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    // options
    const sharpen = form.get('sharpen') === 'true'
    const normalize = form.get('normalize') === 'true'
    const quality = form.get('quality') ? Number(form.get('quality')) : undefined

    const arrayBuffer = await file.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    let img = sharp(input)
    if (normalize) img = img.normalize()
    if (sharpen) img = img.sharpen()

    // if quality provided, output as jpeg with given quality
    let outBuffer: Buffer
    if (typeof quality === 'number') {
      outBuffer = await img.jpeg({ quality: Math.max(10, Math.min(100, quality)) }).toBuffer()
    } else {
      outBuffer = await img.toBuffer()
    }

    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)
    const contentType = file.type || (typeof quality === 'number' ? 'image/jpeg' : 'image/png')

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': contentType, 'Content-Disposition': 'attachment; filename="enhanced.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
