"use client"

import React, { useState } from 'react'

export default function MergeTool() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 PDF files')
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach(file => formData.append('files', file))

      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'merged.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        try {
          const error = await response.json()
          alert(error.error || 'Merge failed')
        } catch {
          alert('Merge failed')
        }
      }
    } catch (error) {
      alert('Failed to merge PDFs')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select PDF Files
          </label>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">{selectedFiles.length} file(s) selected</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleMerge}
            disabled={isProcessing || selectedFiles.length < 2}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {isProcessing ? 'Merging PDFs...' : 'Merge PDFs'}
          </button>
        </div>

        {selectedFiles.length > 0 && selectedFiles.length < 2 && (
          <p className="text-center text-red-600 text-sm">Please select at least 2 PDF files to merge</p>
        )}
      </div>
    </div>
  )
}
