import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as any
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

    const width = form.get('width') ? Number(form.get('width')) : null
    const height = form.get('height') ? Number(form.get('height')) : null

    const arrayBuffer = await file.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    let img = sharp(input)
    if (width || height) {
      img = img.resize(width || null, height || null, { fit: 'inside' })
    }

    const outBuffer = await img.toBuffer()
    const contentType = file.type || await sharp(outBuffer).metadata().then(m => m.format === 'jpeg' ? 'image/jpeg' : m.format === 'png' ? 'image/png' : 'image/png').catch(()=> 'image/png')

    const outArray = outBuffer instanceof Uint8Array ? outBuffer : Uint8Array.from(outBuffer)

  return new Response(outArray as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="resized.png"'
      }
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
}
