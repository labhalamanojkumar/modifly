'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RotatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rotation, setRotation] = useState('90')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleRotate = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file')
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('rotation', rotation)

      const response = await fetch('/api/rotate', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'rotated.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      alert('Failed to rotate PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header provided by global SiteHeader component in app/layout.tsx */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Rotate PDF</h1>
          <p className="mt-4 text-lg text-gray-600">
            Rotate PDF pages to the correct orientation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation Angle
              </label>
              <select
                value={rotation}
                onChange={(e) => setRotation(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="90">90° Clockwise</option>
                <option value="180">180°</option>
                <option value="270">270° Clockwise (90° Counter-clockwise)</option>
              </select>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleRotate}
                disabled={isProcessing || !selectedFile}
                className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isProcessing ? 'Rotating PDF...' : 'Rotate PDF'}
              </button>
            </div>

            {!selectedFile && (
              <p className="text-center text-gray-500 text-sm">
                Please select a PDF file to rotate
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}