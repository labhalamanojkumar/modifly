 'use client'

import { useState } from 'react'

export default function OverlayPage() {
  const [baseFile, setBaseFile] = useState<File | null>(null)
  const [overlayFile, setOverlayFile] = useState<File | null>(null)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!baseFile || !overlayFile) return alert('select files')
    setProcessing(true)
    const fd = new FormData()
    fd.append('base', baseFile)
    fd.append('overlay', overlayFile)
    fd.append('left', String(left))
    fd.append('top', String(top))

    const res = await fetch('/api/images/overlay', { method: 'POST', body: fd })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'failed')
      setProcessing(false)
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    setResultUrl(url)
    setProcessing(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Overlay & Merge Images</h2>
        <label className="block">Base image<input type="file" accept="image/*" onChange={(e) => setBaseFile(e.target.files?.[0] || null)} className="mt-1" /></label>
        <label className="block mt-3">Overlay image<input type="file" accept="image/*" onChange={(e) => setOverlayFile(e.target.files?.[0] || null)} className="mt-1" /></label>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label>Left<input type="number" value={left} onChange={e => setLeft(Number(e.target.value))} className="mt-1 p-2 border rounded" /></label>
          <label>Top<input type="number" value={top} onChange={e => setTop(Number(e.target.value))} className="mt-1 p-2 border rounded" /></label>
        </div>

        <div className="mt-4">
          <button onClick={handleSubmit} disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Apply Overlay'}</button>
          {resultUrl && <a href={resultUrl} download="overlay.png" className="ml-4 text-indigo-700">Download</a>}
        </div>
      </div>
    </main>
  )
}
