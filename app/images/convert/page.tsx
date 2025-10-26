 'use client'

import { useState } from 'react'
import { loadImageFromFile, canvasToBlob } from '../../../components/ImageToolUtils'

export default function ConvertTool() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<'png'|'jpeg'|'webp'>('png')
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setResultUrl(null)
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const img = await loadImageFromFile(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
      const blob = await canvasToBlob(canvas, mime, 0.95)
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } catch (err) {
      console.error(err)
      alert('Failed to convert image')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Convert Image</h2>
        <input type="file" accept="image/*" onChange={onFile} />

        <div className="mt-4">
          <label className="block">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="mt-1 p-2 border rounded">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleConvert} disabled={!file || processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Convert'}</button>
          {resultUrl && (
            <a href={resultUrl} download={`converted.${format === 'jpeg' ? 'jpg' : format}`} className="text-indigo-700">Download result</a>
          )}
        </div>
      </div>
    </main>
  )
}
