import { GifUtil, GifFrame } from 'gifwrap'
// jimp exports are best imported via require in this environment
const Jimp = require('jimp')
import os from 'os'
import path from 'path'
import { writeFile, readFile, unlink } from 'fs/promises'

export async function jsResizeGif(inputBuf: Buffer, width?: number | null, height?: number | null) {
  const gif = await GifUtil.read(inputBuf)
  const frames = gif.frames

  // Determine target size from first frame if not provided
  const first = frames[0]
  const srcW = first.bitmap?.width || width || 320
  const srcH = first.bitmap?.height || height || 240
  const targetW = width || srcW
  const targetH = height || srcH

  // Resize each frame using Jimp
  for (const frame of frames) {
    const img = await Jimp.read(frame.bitmap)
    img.resize(targetW, targetH)
    // replace bitmap
    frame.bitmap = img.bitmap
  }

  // write to temp file and return buffer
  const tmp = os.tmpdir()
  const outPath = path.join(tmp, `gifjs-resize-${Date.now()}.gif`)
  await GifUtil.write(outPath, frames)
  const outBuf = await readFile(outPath)
  try { await unlink(outPath) } catch (e) {}
  return outBuf
}

export async function jsOverlayGif(inputBuf: Buffer, overlayBuf: Buffer, left = 0, top = 0, opacity = 1) {
  const gif = await GifUtil.read(inputBuf)
  const frames = gif.frames

  // Prepare overlay Jimp image; if opacity <1, set opacity
  let overlayImg = await Jimp.read(overlayBuf)
  if (opacity < 1) overlayImg.opacity(opacity)

  for (const frame of frames) {
    const base = await Jimp.read(frame.bitmap)
    base.composite(overlayImg, left, top)
    frame.bitmap = base.bitmap
  }

  const tmp = os.tmpdir()
  const outPath = path.join(tmp, `gifjs-overlay-${Date.now()}.gif`)
  await GifUtil.write(outPath, frames)
  const outBuf = await readFile(outPath)
  try { await unlink(outPath) } catch (e) {}
  return outBuf
}

export async function jsAddTextGif(inputBuf: Buffer, text: string, opts: { size?: number; color?: string; x?: number; y?: number } = {}) {
  const { size = 40, color = '#ffffff', x = 0, y = 40 } = opts
  const gif = await GifUtil.read(inputBuf)
  const frames = gif.frames

  for (const frame of frames) {
    const base = await Jimp.read(frame.bitmap)
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${base.bitmap.width}" height="${base.bitmap.height}" xmlns="http://www.w3.org/2000/svg">\n  <style> .t { font-size: ${size}px; fill: ${color}; font-weight:700; }</style>\n  <text x="${x}" y="${y}" class="t">${escapeXml(text)}</text>\n</svg>`
    const textImg = await Jimp.read(Buffer.from(svg))
    base.composite(textImg, 0, 0)
    frame.bitmap = base.bitmap
  }

  const tmp = os.tmpdir()
  const outPath = path.join(tmp, `gifjs-text-${Date.now()}.gif`)
  await GifUtil.write(outPath, frames)
  const outBuf = await readFile(outPath)
  try { await unlink(outPath) } catch (e) {}
  return outBuf
}

export async function jsCutoutGif(inputBuf: Buffer, maskBuf: Buffer) {
  const gif = await GifUtil.read(inputBuf)
  const frames = gif.frames
  const maskImg = await Jimp.read(maskBuf)

  for (const frame of frames) {
    const base = await Jimp.read(frame.bitmap)
    // apply mask: use maskImg as alpha mask
    base.mask(maskImg, 0, 0)
    frame.bitmap = base.bitmap
  }

  const tmp = os.tmpdir()
  const outPath = path.join(tmp, `gifjs-cutout-${Date.now()}.gif`)
  await GifUtil.write(outPath, frames)
  const outBuf = await readFile(outPath)
  try { await unlink(outPath) } catch (e) {}
  return outBuf
}

export async function jsGlitterGif(inputBuf: Buffer, sparkleBuf?: Buffer) {
  const gif = await GifUtil.read(inputBuf)
  const frames = gif.frames
  let sparkle = sparkleBuf ? await Jimp.read(sparkleBuf) : await Jimp.read(Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='4' fill='white'/></svg>`))

  for (const frame of frames) {
    const base = await Jimp.read(frame.bitmap)
    // tile sparkle across the frame
    for (let x = 0; x < base.bitmap.width; x += sparkle.bitmap.width) {
      for (let y = 0; y < base.bitmap.height; y += sparkle.bitmap.height) {
        base.composite(sparkle, x, y, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 0.6 })
      }
    }
    frame.bitmap = base.bitmap
  }

  const tmp = os.tmpdir()
  const outPath = path.join(tmp, `gifjs-glitter-${Date.now()}.gif`)
  await GifUtil.write(outPath, frames)
  const outBuf = await readFile(outPath)
  try { await unlink(outPath) } catch (e) {}
  return outBuf
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
