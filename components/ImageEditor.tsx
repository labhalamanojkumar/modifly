"use client"

import React, { useState, useRef, useEffect } from 'react'
import { loadImageFromFile, canvasToBlob } from './ImageToolUtils'

type PreviewState = { url: string | null }

export default function ImageEditor() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [angle, setAngle] = useState(90)
  const [quality, setQuality] = useState(80)
  const [sharpen, setSharpen] = useState(true)
  const [normalize, setNormalize] = useState(false)
  const [processing, setProcessing] = useState(false)
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mirrorH, setMirrorH] = useState(false)
  const [mirrorV, setMirrorV] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [downloadQuality, setDownloadQuality] = useState(quality)
  const [serverPreviewing, setServerPreviewing] = useState(false)
  const [viewMode, setViewMode] = useState<'overlay' | 'side-by-side'>('side-by-side')
  const [ops, setOps] = useState<Array<{ op: string; args?: any }>>([])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setResult(null)
    if (f) setPreview(URL.createObjectURL(f))
  }

  // draw preview image into canvas whenever preview changes
  useEffect(() => {
    let cancelled = false
    async function drawOriginal() {
      const canvas = originalCanvasRef.current
      if (!preview || !canvas) return
      try {
        const img = await loadImageFromFile(new File([await (await fetch(preview)).blob()], 'preview', { type: 'image/png' }))
        const ctx = canvas.getContext('2d')!
        canvas.width = img.width
        canvas.height = img.height
        ctx.filter = 'none'
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      } catch (err) {
        console.error('preview draw failed', err)
      }
    }
    if (!cancelled) drawOriginal()
    return () => { cancelled = true }
  }, [preview])

  const callEndpoint = async (path: string, form: FormData) => {
    setProcessing(true)
    try {
      const res = await fetch(path, { method: 'POST', body: form })
      if (!res.ok) throw new Error('processing failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setResult(url)
    } catch (err) {
      console.error(err)
      alert('Processing error')
    } finally {
      setProcessing(false)
    }
  }

  const handleRotate = async () => {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    form.append('angle', String(angle))
    await callEndpoint('/api/images/rotate', form)
  }

  const handleEnhance = async () => {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    form.append('sharpen', String(sharpen))
    form.append('normalize', String(normalize))
    form.append('quality', String(quality))
    await callEndpoint('/api/images/enhance', form)
  }

  const handleClientResize = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const img = await loadImageFromFile(file)
      const canvas = document.createElement('canvas')
      const max = 1200
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const blob = await canvasToBlob(canvas, file.type || 'image/png', quality / 100)
      const url = URL.createObjectURL(blob)
      setResult(url)
    } catch (err) {
      console.error(err)
      alert('Client processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const addOpToStack = () => {
    if (!file) return
    // create op from current controls: either rotate or enhance or resize quick
    const op = { op: 'enhance', args: { sharpen, normalize, quality } }
    setOps((s) => [...s, op])
  }

  const addRotateToStack = () => {
    if (!file) return
    setOps((s) => [...s, { op: 'rotate', args: { angle } }])
  }

  const clearOps = () => setOps([])

  const removeOp = (i: number) => setOps((s) => s.filter((_, idx) => idx !== i))

  const moveOp = (i: number, dir: 'up' | 'down') => {
    setOps((s) => {
      const arr = [...s]
      const j = dir === 'up' ? i - 1 : i + 1
      if (j < 0 || j >= arr.length) return arr
      const tmp = arr[j]
      arr[j] = arr[i]
      arr[i] = tmp
      return arr
    })
  }

  // Preview the current ops stack on the canvas (client-side approximation)
  const previewStack = async () => {
    if (!file || !processedCanvasRef.current) return
    setProcessing(true)
    try {
      const imgEl = await loadImageFromFile(file)
      const canvas = processedCanvasRef.current
      let w = imgEl.width
      let h = imgEl.height
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imgEl, 0, 0)

      for (const step of ops) {
        const op = step.op
        const args = step.args || {}
        if (op === 'rotate') {
          const angle = Number(args.angle) || 0
          const rad = (angle * Math.PI) / 180
          const tmp = document.createElement('canvas')
          tmp.width = canvas.width
          tmp.height = canvas.height
          const tctx = tmp.getContext('2d')!
          tctx.drawImage(canvas, 0, 0)
          if (angle % 180 !== 0) {
            canvas.width = h
            canvas.height = w
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(rad)
          ctx.drawImage(tmp, -tmp.width / 2, -tmp.height / 2)
          ctx.restore()
        } else if (op === 'resize') {
          const tw = args.width ? Number(args.width) : null
          const th = args.height ? Number(args.height) : null
          const twFinal = tw || canvas.width
          const thFinal = th || canvas.height
          const tmp = document.createElement('canvas')
          tmp.width = canvas.width
          tmp.height = canvas.height
          const tctx = tmp.getContext('2d')!
          tctx.drawImage(canvas, 0, 0)
          canvas.width = twFinal
          canvas.height = thFinal
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height)
        } else if (op === 'crop') {
          const left = Number(args.left) || 0
          const top = Number(args.top) || 0
          const width = Number(args.width) || canvas.width
          const height = Number(args.height) || canvas.height
          const tmp = document.createElement('canvas')
          tmp.width = canvas.width
          tmp.height = canvas.height
          const tctx = tmp.getContext('2d')!
          tctx.drawImage(canvas, 0, 0)
          canvas.width = width
          canvas.height = height
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(tmp, left, top, width, height, 0, 0, width, height)
        } else if (op === 'enhance') {
          const normalize = Boolean(args.normalize)
          const sharpen = Boolean(args.sharpen)
          const filters: string[] = []
          if (normalize) filters.push('contrast(1.12)')
          if (sharpen) filters.push('contrast(1.05)')
          ctx.save()
          ctx.filter = filters.join(' ')
          const tmp = document.createElement('canvas')
          tmp.width = canvas.width
          tmp.height = canvas.height
          const tctx = tmp.getContext('2d')!
          tctx.drawImage(canvas, 0, 0)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(tmp, 0, 0)
          ctx.restore()
        }
      }

      // apply mirror transforms if requested
      if (mirrorH || mirrorV) {
        const tmp = document.createElement('canvas')
        tmp.width = canvas.width
        tmp.height = canvas.height
        const tctx = tmp.getContext('2d')!
        tctx.drawImage(canvas, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        // set transform origin to top-left after applying translate
        ctx.translate(mirrorH ? canvas.width : 0, mirrorV ? canvas.height : 0)
        ctx.scale(mirrorH ? -1 : 1, mirrorV ? -1 : 1)
        ctx.drawImage(tmp, 0, 0)
        ctx.restore()
      }

      // create preview blob and show as result preview (not server-accurate)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve as any, 'image/png'))
      if (blob) {
        const url = URL.createObjectURL(blob)
        setResult(url)
      }
      ctx.restore()
    } catch (err) {
      console.error('previewStack failed', err)
    } finally {
      setProcessing(false)
    }
  }

  // server-side composition: debounce changes and request composed image
  useEffect(() => {
    if (!file) return
    let cancelled = false
    // don't request if another manual processing is running
    if (processing) return
    setServerPreviewing(true)
    const t = setTimeout(async () => {
      try {
        // call the server compose endpoint and draw result
        const form = new FormData()
        form.append('file', file)
        if (ops && ops.length) form.append('ops', JSON.stringify(ops))
        form.append('mirrorH', String(mirrorH))
        form.append('mirrorV', String(mirrorV))
        form.append('quality', String(downloadQuality))
        form.append('format', downloadFormat)
        const res = await fetch('/api/images/compose', { method: 'POST', body: form })
        if (!res.ok) throw new Error('compose failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setResult(url)
        // draw into processed canvas
        try {
          const img = await loadImageFromFile(new File([blob], 'processed', { type: blob.type }))
          const canvas = processedCanvasRef.current
          if (canvas) {
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')!
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
          }
        } catch (err) {
          console.error('drawing processed failed', err)
        }
      } catch (err) {
        console.error('server preview failed', err)
        // fallback to client previewStack
        try {
          await previewStack()
        } catch (e) {
          console.error('previewStack fallback failed', e)
        }
      } finally {
        if (!cancelled) setServerPreviewing(false)
      }
    }, 600)
    return () => { cancelled = true; clearTimeout(t) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, preview, mirrorH, mirrorV, downloadFormat, downloadQuality, JSON.stringify(ops)])

  // draw processed image into processedCanvas whenever `result` (blob URL) changes
  useEffect(() => {
    if (!result || !processedCanvasRef.current) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      const canvas = processedCanvasRef.current!
      // set canvas internal size to image natural size
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      // style to be responsive
      canvas.style.width = '100%'
      canvas.style.height = 'auto'
      const ctx = canvas.getContext('2d')!
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // apply mirror if requested
      if (mirrorH || mirrorV) {
        ctx.translate(mirrorH ? canvas.width : 0, mirrorV ? canvas.height : 0)
        ctx.scale(mirrorH ? -1 : 1, mirrorV ? -1 : 1)
        ctx.drawImage(img, 0, 0)
      } else {
        ctx.drawImage(img, 0, 0)
      }
      ctx.restore()
    }
    img.onerror = (e) => {
      console.error('failed to load processed image', e)
    }
    img.src = result
    return () => { cancelled = true }
  }, [result, mirrorH, mirrorV])

  const applyStack = async () => {
    if (!file || ops.length === 0) return
    setProcessing(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('ops', JSON.stringify(ops))
      await callEndpoint('/api/images/compose', form)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Advanced Image Editor</h2>
      <input type="file" accept="image/*" onChange={onFile} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label>
          Rotate (deg)
          <select value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="mt-1 block w-full border rounded p-2">
            <option value={90}>90</option>
            <option value={180}>180</option>
            <option value={270}>270</option>
            <option value={0}>0</option>
          </select>
        </label>

        <label>
          Quality (output)
          <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-1 w-full" />
          <div className="text-sm text-gray-600">{quality}%</div>
        </label>
      </div>

      <label className="mt-3 inline-flex items-center gap-2">
        <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} /> Sharpen
      </label>
      <label className="mt-3 inline-flex items-center gap-2 ml-6">
        <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} /> Auto-normalize (contrast)
      </label>

      <div className="mt-3 inline-flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={mirrorH} onChange={(e) => setMirrorH(e.target.checked)} /> Mirror Horizontal
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={mirrorV} onChange={(e) => setMirrorV(e.target.checked)} /> Mirror Vertical
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={handleRotate} disabled={!file || processing} className="bg-indigo-600 text-white px-4 py-2 rounded">{processing ? 'Processing...' : 'Rotate'}</button>
        <button onClick={handleEnhance} disabled={!file || processing} className="bg-green-600 text-white px-4 py-2 rounded">Enhance</button>
        <button onClick={handleClientResize} disabled={!file || processing} className="bg-pink-600 text-white px-4 py-2 rounded">Quick Resize (client)</button>
        <button onClick={addRotateToStack} disabled={!file} className="bg-indigo-500 text-white px-3 py-2 rounded">Add Rotate to Stack</button>
        <button onClick={addOpToStack} disabled={!file} className="bg-green-500 text-white px-3 py-2 rounded">Add Enhance to Stack</button>
        <button onClick={applyStack} disabled={!file || ops.length === 0 || processing} className="bg-purple-600 text-white px-3 py-2 rounded">{processing ? 'Applying...' : 'Apply Stack'}</button>
        {result && (
          <a href={result} download="result.png" className="text-indigo-700">Download result</a>
        )}
      </div>

      <div className="mt-2">
        <button onClick={previewStack} disabled={!file || processing} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2">Preview Stack (client)</button>
      </div>

      {ops.length > 0 && (
        <div className="mt-4 bg-slate-50 p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <strong>Operation Stack</strong>
            <div className="flex gap-2">
              <button onClick={clearOps} className="text-sm text-red-600">Clear</button>
            </div>
          </div>
          <ol className="list-decimal list-inside text-sm">
            {ops.map((o, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="truncate mr-2">{o.op} {o.args ? JSON.stringify(o.args) : ''}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveOp(i, 'up')} className="text-xs text-gray-700">↑</button>
                  <button onClick={() => moveOp(i, 'down')} className="text-xs text-gray-700">↓</button>
                  <button onClick={() => removeOp(i)} className="text-xs text-red-600 ml-2">Remove</button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(preview || result) && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium mb-2">Before / After Preview</div>
            <div>
              <label className="text-sm mr-2">View</label>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)} className="border rounded p-1">
                <option value="side-by-side">Side by side</option>
                <option value="overlay">Overlay</option>
              </select>
            </div>
          </div>

          {viewMode === 'overlay' ? (
            <>
              <div className="relative w-full rounded-md shadow overflow-hidden" style={{ maxWidth: '100%' }}>
                {/* original canvas underneath */}
                <canvas ref={originalCanvasRef} className="block w-full h-auto" style={{ position: 'relative', zIndex: 1 }} />
                {/* processed canvas clipped by slider */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPos}%`, height: '100%', overflow: 'hidden', zIndex: 2 }}>
                  <canvas ref={processedCanvasRef} className="block w-full h-auto" style={{ position: 'relative', display: 'block' }} />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-sm">Reveal processed (%)</label>
                <input type="range" min={0} max={100} value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="w-full mt-1" />
              </div>
            </>
          ) : (
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">Original</div>
                <div className="w-full h-auto bg-white rounded-md shadow overflow-hidden">
                  <canvas ref={originalCanvasRef} className="block w-full" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">Processed</div>
                <div className="w-full h-auto bg-white rounded-md shadow overflow-hidden">
                  <canvas ref={processedCanvasRef} className="block w-full" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm block">Download format</label>
              <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as any)} className="mt-1 block w-full border rounded p-2">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div>
              <label className="text-sm block">Quality (if supported)</label>
              <input type="range" min={10} max={100} value={downloadQuality} onChange={(e) => setDownloadQuality(Number(e.target.value))} className="w-full mt-1" />
              <div className="text-xs text-gray-600">{downloadQuality}%</div>
            </div>

            <div className="flex gap-2">
              <button onClick={async () => {
                if (!file) return
                setProcessing(true)
                try {
                  const form = new FormData()
                  form.append('file', file)
                  if (ops && ops.length) form.append('ops', JSON.stringify(ops))
                  form.append('mirrorH', String(mirrorH))
                  form.append('mirrorV', String(mirrorV))
                  form.append('quality', String(downloadQuality))
                  form.append('format', downloadFormat)
                  const res = await fetch('/api/images/compose', { method: 'POST', body: form })
                  if (!res.ok) throw new Error('compose failed')
                  const blob = await res.blob()
                  const ext = downloadFormat === 'jpeg' ? 'jpg' : downloadFormat
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `result.${ext}`
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(url)
                } catch (err) {
                  console.error('download failed', err)
                  alert('Download failed')
                } finally {
                  setProcessing(false)
                }
              }} className="bg-indigo-600 text-white px-4 py-2 rounded">Download</button>

              <button onClick={async () => {
                // force server refresh for preview
                if (!file) return
                setServerPreviewing(true)
                try {
                  const form = new FormData()
                  form.append('file', file)
                  if (ops && ops.length) form.append('ops', JSON.stringify(ops))
                  form.append('mirrorH', String(mirrorH))
                  form.append('mirrorV', String(mirrorV))
                  form.append('quality', String(downloadQuality))
                  form.append('format', downloadFormat)
                  const res = await fetch('/api/images/compose', { method: 'POST', body: form })
                  if (!res.ok) throw new Error('compose failed')
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  setResult(url)
                  const img = await loadImageFromFile(new File([blob], 'processed', { type: blob.type }))
                  const canvas = processedCanvasRef.current
                  if (canvas) {
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')!
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0)
                  }
                } catch (err) {
                  console.error('manual compose failed', err)
                  alert('Compose failed')
                } finally {
                  setServerPreviewing(false)
                }
              }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Refresh Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
