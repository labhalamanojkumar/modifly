import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    const quality = form.get('quality') ? Number(form.get('quality')) : 80
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    // compress by encoding to jpeg with a quality
    const outBuffer = await sharp(input).jpeg({ quality: Math.max(10, Math.min(100, quality)) }).toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Content-Disposition': 'attachment; filename="compressed.jpg"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
