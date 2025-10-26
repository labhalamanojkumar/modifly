 'use client'

import { useState } from 'react'
import { loadImageFromFile, canvasToBlob } from '../../../components/ImageToolUtils'

export default function ResizeTool() {
  const [file, setFile] = useState<File | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [keepAspect, setKeepAspect] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setResultUrl(null)
    if (f) setImgUrl(URL.createObjectURL(f))
  }

  const handleProcess = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const img = await loadImageFromFile(file)
      let targetW = Number(width) || img.width
      let targetH = Number(height) || img.height
      if (keepAspect) {
        if (width && !height) {
          targetH = Math.round((img.height / img.width) * targetW)
        } else if (!width && height) {
          targetW = Math.round((img.width / img.height) * targetH)
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, targetW, targetH)
      const blob = await canvasToBlob(canvas, file.type || 'image/png', 0.92)
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } catch (err) {
      console.error(err)
      alert('Failed to process image')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Resize Image</h2>
        <input type="file" accept="image/*" onChange={onFile} />
        {imgUrl && (
          <div className="mt-4">
            {/* data URL preview — next/image doesn't support data URLs; keep plain img and ignore lint warning */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="preview" className="max-w-full rounded-md shadow" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            Width (px)
            <input type="number" value={width as any} onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="block">
            Height (px)
            <input type="number" value={height as any} onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
          </label>
        </div>

        <label className="mt-3 inline-flex items-center gap-2">
          <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} /> Keep aspect ratio
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleProcess} disabled={!file || processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Resize'}</button>
          {resultUrl && (
            <a href={resultUrl} download="resized.png" className="text-indigo-700">Download result</a>
          )}
        </div>
      </div>
    </main>
  )
}
