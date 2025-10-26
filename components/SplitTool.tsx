"use client"

import React, { useState } from 'react'

export default function SplitTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleSplit = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file')
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/split', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'split_pages.zip'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        try {
          const error = await response.json()
          alert(error.error || 'Split failed')
        } catch {
          alert('Split failed')
        }
      }
    } catch (error) {
      alert('Failed to split PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSplit}
            disabled={isProcessing || !selectedFile}
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {isProcessing ? 'Splitting PDF...' : 'Split PDF'}
          </button>
        </div>

        {!selectedFile && (
          <p className="text-center text-gray-500 text-sm">Please select a PDF file to split</p>
        )}
      </div>
    </div>
  )
}
