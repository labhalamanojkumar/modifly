 'use client'

import { useState } from 'react'

export default function MaskPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mask, setMask] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!file || !mask) return alert('select file and mask')
    setProcessing(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('mask', mask)

    const res = await fetch('/api/images/mask', { method: 'POST', body: fd })
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
        <h2 className="text-2xl font-semibold mb-4">Apply Mask / Frame</h2>
        <label className="block">Image<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" /></label>
        <label className="block mt-3">Mask (PNG with alpha)<input type="file" accept="image/*" onChange={(e) => setMask(e.target.files?.[0] || null)} className="mt-1" /></label>

        <div className="mt-4">
          <button onClick={handleSubmit} disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Apply Mask'}</button>
          {resultUrl && <a href={resultUrl} download="masked.png" className="ml-4 text-indigo-700">Download</a>}
        </div>
      </div>
    </main>
  )
}
