import { composeImage, Op } from '../../../../lib/imageCompose'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    const opsRaw = form.get('ops') as any
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    const ops: Op[] = opsRaw ? JSON.parse(String(opsRaw)) : []

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const outBuffer = await composeImage(buffer, ops)

    const isJpeg = ops.some(s => s.op === 'enhance' && s.args && typeof s.args.quality === 'number')
    const contentType = isJpeg ? 'image/jpeg' : 'image/png'

    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)
    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': contentType, 'Content-Disposition': 'attachment; filename="composed.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
