"use client"

import GifToolForm from '../../../../components/GifToolForm'

export default function GifGlitterPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Add Glitter to GIF</h2>
        <p className="text-sm text-gray-600 mb-4">Adds a glitter overlay effect across frames.</p>
        <GifToolForm endpoint="/api/images/gif/glitter" fields={[{ name: 'intensity', label: 'Intensity (1-10)', default: '4' }]} submitLabel="Apply Glitter" />
      </div>
    </main>
  )
}
