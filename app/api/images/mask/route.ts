import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    const mask = form.get('mask') as any
    if (!file || !mask) return new Response(JSON.stringify({ error: 'file and mask required' }), { status: 400 })

    const inputBuf = Buffer.from(await file.arrayBuffer())
    const maskBuf = Buffer.from(await mask.arrayBuffer())

    // Ensure mask is a single channel alpha mask
    const preparedMask = await sharp(maskBuf).ensureAlpha().toBuffer()

    const outBuffer = await sharp(inputBuf).composite([{ input: preparedMask, blend: 'dest-in' }]).toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': file.type || 'image/png', 'Content-Disposition': 'attachment; filename="masked.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
