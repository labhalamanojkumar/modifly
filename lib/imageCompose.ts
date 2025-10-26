import sharp from 'sharp'

export type Op = { op: string; args?: Record<string, any> }

export async function composeImage(inputBuffer: Buffer, ops: Op[]): Promise<Buffer> {
  let img = sharp(inputBuffer)

  for (const step of ops) {
    const op = step.op
    const args = step.args || {}
    if (op === 'rotate') {
      const angle = Number(args.angle) || 0
      img = img.rotate(angle)
    } else if (op === 'resize') {
      const w = args.width ? Number(args.width) : null
      const h = args.height ? Number(args.height) : null
      img = img.resize(w || null, h || null, { fit: 'inside' })
    } else if (op === 'crop') {
      const left = Number(args.left) || 0
      const top = Number(args.top) || 0
      const width = Number(args.width)
      const height = Number(args.height)
      const extractOpts: any = { left, top }
      if (width) extractOpts.width = width
      if (height) extractOpts.height = height
      img = img.extract(extractOpts)
    } else if (op === 'enhance') {
      if (args.normalize) img = img.normalize()
      if (args.sharpen) img = img.sharpen()
    }
  }

  const wantsQuality = ops.some(s => s.op === 'enhance' && s.args && typeof s.args.quality === 'number')
  if (wantsQuality) {
    const q = ops.find(s => s.op === 'enhance' && s.args && typeof s.args.quality === 'number')!.args!.quality
    return img.jpeg({ quality: Math.max(10, Math.min(100, Number(q))) }).toBuffer()
  }

  return img.toBuffer()
}
