"use client"

import { useState, useRef, useCallback } from 'react'

type Props = {
  endpoint: string
  fields?: Array<{ name: string; label: string; type?: string; default?: string }>
  submitLabel?: string
}

export default function GifToolForm({ endpoint, fields = [], submitLabel = 'Process' }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [extraValues, setExtraValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(f => [f.name, f.default || ''])))
  const [extraFiles, setExtraFiles] = useState<Record<string, File | null>>(() => Object.fromEntries(fields.map(f => [f.name, null])))
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0] || null
    if (f) setFile(f)
  }, [])

  const onChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
  }

  const upload = () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    setError(null)
    setResultUrl(null)

    const form = new FormData()
    form.append('file', file)
    for (const k of Object.keys(extraValues)) {
      if (extraValues[k] !== '') form.append(k, extraValues[k])
    }
    // attach file-type fields (mask/overlay etc.)
    for (const k of Object.keys(extraFiles)) {
      const f = extraFiles[k]
      if (f) form.append(k, f)
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)
    xhr.responseType = 'blob'
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
    }
    xhr.onload = () => {
      setProcessing(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
      } else {
        try {
          const txt = xhr.response && typeof xhr.response === 'object' ? null : xhr.response
          setError(`Server error: ${xhr.status}`)
        } catch (e) {
          setError(`Server error: ${xhr.status}`)
        }
      }
    }
    xhr.onerror = () => { setProcessing(false); setError('Upload failed') }
    xhr.send(form)
  }

  return (
    <div>
      <div
        ref={dropRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-gray-300 rounded p-6 text-center bg-white"
      >
        <p className="text-sm text-gray-600">Drag & drop a GIF here, or</p>
        <label className="mt-2 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer">
          <span>Select file</span>
          <input type="file" accept="image/gif" onChange={onChoose} className="hidden" />
        </label>
        {file && <div className="mt-3 text-sm">Selected: {file.name} — {(file.size/1024|0)} KB</div>}
      </div>

      <div className="mt-4 space-y-3">
        {fields.map(f => (
          <label key={f.name} className="block">
            <div className="text-sm mb-1">{f.label}</div>
            {(f.type === 'file' || f.name === 'mask' || f.name === 'overlay') ? (
              <input type="file" accept="image/*" onChange={(e) => setExtraFiles(v => ({ ...v, [f.name]: e.target.files?.[0] ?? null }))} className="w-full" />
            ) : (
              <input value={extraValues[f.name] || ''} onChange={(e) => setExtraValues(v => ({ ...v, [f.name]: e.target.value }))} className="w-full border p-2 rounded" />
            )}
            {extraFiles[f.name] && <div className="text-xs text-gray-500 mt-1">Selected file: {extraFiles[f.name]?.name}</div>}
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={upload} disabled={!file || processing} className="px-4 py-2 bg-indigo-600 text-white rounded">{processing ? 'Processing...' : submitLabel}</button>
        {processing && <div className="w-48"><div className="h-2 bg-gray-200 rounded"><div style={{ width: `${progress}%` }} className="h-2 bg-indigo-500 rounded" /></div><div className="text-xs text-gray-500 mt-1">{progress}%</div></div>}
        {resultUrl && <a href={resultUrl} download className="text-indigo-700">Download result</a>}
      </div>

      {error && <div className="mt-3 text-red-600">{error}</div>}

      {file && (
        <div className="mt-4 bg-white p-2 rounded shadow">
          <div className="text-sm text-gray-500 mb-2">Preview</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={URL.createObjectURL(file)} alt="preview" className="max-w-full" />
        </div>
      )}
    </div>
  )
}
