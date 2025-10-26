import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    const angle = form.get('angle') ? Number(form.get('angle')) : 90

    const arrayBuffer = await file.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    const outBuffer = await sharp(input).rotate(angle).toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)
    const contentType = file.type || 'image/png'

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': contentType, 'Content-Disposition': 'attachment; filename="rotated.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
