"use client"

import GifToolForm from '../../../../components/GifToolForm'

export default function GifCutoutPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">GIF Cutout (Mask)</h2>
        <p className="text-sm text-gray-600 mb-4">Provide a mask image where white areas are kept and black areas are removed.</p>
  <GifToolForm endpoint="/api/images/gif/cutout" fields={[{ name: 'mask', label: 'Mask (white=keep, black=remove)', type: 'file' }]} submitLabel="Apply Mask" />
      </div>
    </main>
  )
}
