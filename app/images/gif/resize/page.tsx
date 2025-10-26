"use client"

import GifToolForm from '../../../../components/GifToolForm'

export default function GifResizePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Resize Animated GIF</h2>
        <GifToolForm endpoint="/api/images/gif/resize" fields={[{ name: 'width', label: 'Width (px)' }, { name: 'height', label: 'Height (px)' }]} submitLabel="Resize GIF" />
      </div>
    </main>
  )
}
