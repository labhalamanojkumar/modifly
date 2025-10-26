 'use client'

import { useState } from 'react'
import { loadImageFromFile, canvasToBlob } from '../../../components/ImageToolUtils'

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setResultUrl(null)
  }

  const handleCompress = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const img = await loadImageFromFile(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } catch (err) {
      console.error(err)
      alert('Failed to compress image')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Compress Image</h2>
        <input type="file" accept="image/*" onChange={onFile} />

        <div className="mt-4">
          <label>Quality: {Math.round(quality * 100)}%</label>
          <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleCompress} disabled={!file || processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Compress'}</button>
          {resultUrl && (
            <a href={resultUrl} download="compressed.jpg" className="text-indigo-700">Download result</a>
          )}
        </div>
      </div>
    </main>
  )
}
