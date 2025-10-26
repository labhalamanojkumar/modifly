'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function OrganizePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pageOrder, setPageOrder] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleOrganize = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file')
      return
    }

    if (!pageOrder.trim()) {
      alert('Please specify the page order')
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('pageOrder', pageOrder)

      const response = await fetch('/api/organize', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'organized.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      alert('Failed to organize PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header provided by global SiteHeader component in app/layout.tsx */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Organize PDF</h1>
          <p className="mt-4 text-lg text-gray-600">
            Reorder, delete, or extract pages from PDF
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
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Order
              </label>
              <input
                type="text"
                value={pageOrder}
                onChange={(e) => setPageOrder(e.target.value)}
                placeholder="e.g., 2,1,3 (reorder) or 1,3 (keep only pages 1 and 3)"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter page numbers separated by commas (1-based indexing)
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleOrganize}
                disabled={isProcessing || !selectedFile || !pageOrder.trim()}
                className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isProcessing ? 'Organizing PDF...' : 'Organize PDF'}
              </button>
            </div>

            {(!selectedFile || !pageOrder.trim()) && (
              <p className="text-center text-gray-500 text-sm">
                Please select a PDF file and specify page order
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