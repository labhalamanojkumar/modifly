import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    const top = form.get('top') ? Number(form.get('top')) : 0
    const left = form.get('left') ? Number(form.get('left')) : 0
    const width = form.get('width') ? Number(form.get('width')) : null
    const height = form.get('height') ? Number(form.get('height')) : null

    const arrayBuffer = await file.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    const img = sharp(input)
    const meta = await img.metadata()
    const extractOpts: any = { left: left || 0, top: top || 0 }
    if (width) extractOpts.width = width
    if (height) extractOpts.height = height

    const outBuffer = await img.extract(extractOpts).toBuffer()
    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)
    const contentType = file.type || 'image/png'

    return new Response(outArray as any, { status: 200, headers: { 'Content-Type': contentType, 'Content-Disposition': 'attachment; filename="cropped.png"' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
