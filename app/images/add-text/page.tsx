 'use client'

import { useState } from 'react'

export default function AddTextPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('Hello World')
  const [size, setSize] = useState(48)
  const [color, setColor] = useState('#ffffff')
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!file) return alert('select file')
    setProcessing(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('text', text)
    fd.append('size', String(size))
    fd.append('color', color)

    const res = await fetch('/api/images/add-text', { method: 'POST', body: fd })
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
        <h2 className="text-2xl font-semibold mb-4">Add Text to Image</h2>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="mt-3">
          <label className="block">Text</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label>Size<input type="number" value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-1 p-2 border rounded" /></label>
          <label>Color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 p-2 border rounded" /></label>
        </div>

        <div className="mt-4">
          <button onClick={handleSubmit} disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Add Text'}</button>
          {resultUrl && <a href={resultUrl} download="text.png" className="ml-4 text-indigo-700">Download</a>}
        </div>
      </div>
    </main>
  )
}
