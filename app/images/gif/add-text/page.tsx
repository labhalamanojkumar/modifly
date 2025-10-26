"use client"

import GifToolForm from '../../../../components/GifToolForm'

export default function GifAddTextPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Add Text to GIF</h2>
        <p className="text-sm text-gray-600 mb-4">Render text across all frames of an animated GIF.</p>
        <GifToolForm endpoint="/api/images/gif/add-text" fields={[{ name: 'text', label: 'Text' }, { name: 'size', label: 'Font size', default: '40' }, { name: 'x', label: 'X (px)', default: '0' }, { name: 'y', label: 'Y (px)', default: '40' }]} submitLabel="Add Text" />
      </div>
    </main>
  )
}
