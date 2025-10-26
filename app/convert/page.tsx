'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ConvertPage() {
  // page JSON-LD for FAQ / common conversions
  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {"@type": "Question", name: "How do I convert PDF to Word?", acceptedAnswer: {"@type": "Answer", text: "Choose PDF to Word and upload your PDF. The converted .docx will be available to download."}},
      {"@type": "Question", name: "Can I convert images to PDF?", acceptedAnswer: {"@type": "Answer", text: "Select Images to PDF and upload your image files. We'll combine them into a single PDF."}},
      {"@type": "Question", name: "Is my file private?", acceptedAnswer: {"@type": "Answer", text: "Files are processed locally when possible; for server-side conversions we do not share your files with third parties."}}
    ]
  }
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [conversionType, setConversionType] = useState('pdf-to-word')
  const [isProcessing, setIsProcessing] = useState(false)

  const conversionOptions = [
    // PDF to other formats
    { value: 'pdf-to-word', label: 'PDF to Word (.docx)', inputAccept: '.pdf', outputExt: 'docx' },
    { value: 'pdf-to-excel', label: 'PDF to Excel (.xlsx)', inputAccept: '.pdf', outputExt: 'xlsx' },
    { value: 'pdf-to-powerpoint', label: 'PDF to PowerPoint (.pptx)', inputAccept: '.pdf', outputExt: 'pptx' },
    { value: 'pdf-to-text', label: 'PDF to Text (.txt)', inputAccept: '.pdf', outputExt: 'txt' },
    // Other formats to PDF
    { value: 'word-to-pdf', label: 'Word to PDF', inputAccept: '.doc,.docx,.rtf,.odt', outputExt: 'pdf' },
    { value: 'excel-to-pdf', label: 'Excel to PDF', inputAccept: '.xls,.xlsx,.ods,.csv', outputExt: 'pdf' },
    { value: 'powerpoint-to-pdf', label: 'PowerPoint to PDF', inputAccept: '.ppt,.pptx,.odp', outputExt: 'pdf' },
    { value: 'doc-to-pdf', label: 'DOC to PDF', inputAccept: '.doc', outputExt: 'pdf' },
    { value: 'xls-to-pdf', label: 'XLS to PDF', inputAccept: '.xls', outputExt: 'pdf' },
    { value: 'ppt-to-pdf', label: 'PPT to PDF', inputAccept: '.ppt', outputExt: 'pdf' },
    { value: 'docx-to-pdf', label: 'DOCX to PDF', inputAccept: '.docx', outputExt: 'pdf' },
    { value: 'xlsx-to-pdf', label: 'XLSX to PDF', inputAccept: '.xlsx', outputExt: 'pdf' },
    { value: 'pptx-to-pdf', label: 'PPTX to PDF', inputAccept: '.pptx', outputExt: 'pdf' },
    { value: 'rtf-to-pdf', label: 'RTF to PDF', inputAccept: '.rtf', outputExt: 'pdf' },
    { value: 'odt-to-pdf', label: 'ODT to PDF', inputAccept: '.odt', outputExt: 'pdf' },
    { value: 'ods-to-pdf', label: 'ODS to PDF', inputAccept: '.ods', outputExt: 'pdf' },
    { value: 'odp-to-pdf', label: 'ODP to PDF', inputAccept: '.odp', outputExt: 'pdf' },
    { value: 'csv-to-pdf', label: 'CSV to PDF', inputAccept: '.csv', outputExt: 'pdf' },
    { value: 'html-to-pdf', label: 'HTML to PDF', inputAccept: '.html,.htm', outputExt: 'pdf' },
    { value: 'txt-to-pdf', label: 'TXT to PDF', inputAccept: '.txt', outputExt: 'pdf' },
    { value: 'xml-to-pdf', label: 'XML to PDF', inputAccept: '.xml', outputExt: 'pdf' },
    { value: 'images-to-pdf', label: 'Images to PDF', inputAccept: 'image/*', outputExt: 'pdf' },
    { value: 'text-to-pdf', label: 'Text to PDF', inputAccept: '.txt', outputExt: 'pdf' },
  ]

  const selectedOption = conversionOptions.find(opt => opt.value === conversionType)

  const [depsLoading, setDepsLoading] = useState(true)
  const [hasSoffice, setHasSoffice] = useState<boolean | null>(null)
  const [hasMagick, setHasMagick] = useState<boolean | null>(null)
  const [hasGifsicle, setHasGifsicle] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/check-deps')
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        if (!mounted) return
        setHasMagick(Boolean(data.magick))
        setHasGifsicle(Boolean(data.gifsicle))
        setHasSoffice(Boolean(data.soffice))
      } catch (e) {
        if (!mounted) return
        setHasMagick(null)
        setHasGifsicle(null)
        setHasSoffice(null)
      } finally {
        if (mounted) setDepsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      alert('Please select a file')
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('conversionType', conversionType)

      // Use Python-backed endpoint for PDF-to-* conversions to improve reliability
      const endpoint = conversionType.startsWith('pdf-to-') ? '/api/convert/python' : '/api/convert'
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `converted.${selectedOption?.outputExt || 'file'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      alert('Failed to convert file')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-3">Convert PDFs to Word, Excel, PowerPoint and more</h2>
          <p className="text-gray-600">Converting PDFs into editable formats is a common requirement for collaboration and reuse. Modifly focuses on preserving text flow, images, and layout while exporting to DOCX, XLSX, PPTX or plain text. For image-heavy PDFs we also provide image extraction so you can repurpose illustrations in presentations or documents.</p>

          <h3 className="mt-6 text-lg font-semibold">Conversion approach</h3>
          <p className="text-gray-600">We use a hybrid approach: client-side tools where possible for quick conversions, and a Python-backed extraction for complex PDFs to capture images and layout. The goal is to give you editable output that needs minimal touch-up. In the case of PowerPoint, Modifly tries to produce sensible slide breaks and puts images on separate slides to simplify editing.</p>

          <h3 className="mt-6 text-lg font-semibold">Practical tips</h3>
          <ul className="list-disc list-inside text-gray-600 mt-3">
            <li>For best results, provide PDFs with embedded text (not scanned images) or use OCR beforehand.</li>
            <li>Large tables convert better when the source PDF uses clear table structures.</li>
            <li>If layout is critical, convert to DOCX and then fine-tune in Word before exporting to other formats.</li>
          </ul>

          <figure className="mt-6">
            <img src="/samples/convert-demo.svg" alt="Convert demo" className="w-full rounded border" />
            <figcaption className="text-xs text-gray-500 mt-2">Demo: converting a PDF into editable formats (DOCX, TXT).</figcaption>
          </figure>
        </div>
      </section>
      {/* Header provided by global SiteHeader component in app/layout.tsx */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">        
        {/* dependency notices */}
        {!depsLoading && (
          <div className="space-y-2 mb-6">
            {hasMagick === false && (
              <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200 text-yellow-800">
                ImageMagick not found — PDF → images (pages) conversion requires ImageMagick or GraphicsMagick.
              </div>
            )}
          </div>
        )}

        <div className="py-6">
        
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        </div>

      </div>
      
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Convert Files</h1>
          <p className="mt-4 text-lg text-gray-600">
            Convert between PDF and other file formats
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversion Type
              </label>
              <select
                value={conversionType}
                onChange={(e) => setConversionType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              >
                <optgroup label="PDF to Other Formats">
                  <option value="pdf-to-word">PDF to Word (.docx)</option>
                  <option value="pdf-to-excel">PDF to Excel (.xlsx)</option>
                  <option value="pdf-to-powerpoint">PDF to PowerPoint (.pptx)</option>
                  <option value="pdf-to-text">PDF to Text (.txt)</option>
                </optgroup>
                <optgroup label="Microsoft Office to PDF">
                  <option value="word-to-pdf">Word to PDF (.doc, .docx)</option>
                  <option value="excel-to-pdf">Excel to PDF (.xls, .xlsx)</option>
                  <option value="powerpoint-to-pdf">PowerPoint to PDF (.ppt, .pptx)</option>
                  <option value="doc-to-pdf">DOC to PDF</option>
                  <option value="xls-to-pdf">XLS to PDF</option>
                  <option value="ppt-to-pdf">PPT to PDF</option>
                  <option value="docx-to-pdf">DOCX to PDF</option>
                  <option value="xlsx-to-pdf">XLSX to PDF</option>
                  <option value="pptx-to-pdf">PPTX to PDF</option>
                </optgroup>
                <optgroup label="OpenDocument to PDF">
                  <option value="odt-to-pdf">ODT to PDF</option>
                  <option value="ods-to-pdf">ODS to PDF</option>
                  <option value="odp-to-pdf">ODP to PDF</option>
                </optgroup>
                <optgroup label="Other Formats to PDF">
                  <option value="rtf-to-pdf">RTF to PDF</option>
                  <option value="csv-to-pdf">CSV to PDF</option>
                  <option value="html-to-pdf">HTML to PDF</option>
                  <option value="txt-to-pdf">TXT to PDF</option>
                  <option value="xml-to-pdf">XML to PDF</option>
                  <option value="images-to-pdf">Images to PDF</option>
                  <option value="text-to-pdf">Text to PDF</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept={selectedOption?.inputAccept || "*"}
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={isProcessing || !selectedFile}
                className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isProcessing ? 'Converting...' : 'Convert File'}
              </button>
            </div>

            {!selectedFile && (
              <p className="text-center text-gray-500 text-sm">
                Please select a file to convert
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