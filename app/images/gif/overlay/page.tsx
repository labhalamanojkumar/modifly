"use client"

import GifToolForm from '../../../../components/GifToolForm'

export default function GifOverlayPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Overlay Image on GIF</h2>
        <p className="text-sm text-gray-600 mb-4">Upload a GIF and an overlay image (PNG recommended). Use the left/top inputs to position the overlay.</p>
        <GifToolForm
          endpoint="/api/images/gif/overlay"
          fields={[
            { name: 'overlay', label: 'Overlay image', type: 'file' },
            { name: 'left', label: 'Left (px)', default: '0' },
            { name: 'top', label: 'Top (px)', default: '0' },
            { name: 'opacity', label: 'Opacity (0..1)', default: '1' },
          ]}
          submitLabel="Overlay GIF"
        />
      </div>
    </main>
  )
}
