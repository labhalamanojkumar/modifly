import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageOrder = formData.get('pageOrder') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 })
    }

    if (!pageOrder || pageOrder.trim().length === 0) {
      return NextResponse.json({ error: 'Please specify page order (e.g., 2,1,3)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const totalPages = pdf.getPageCount()

    // Parse page order (1-based indices)
    const pageIndices = pageOrder.split(',').map(s => {
      const num = parseInt(s.trim())
      if (isNaN(num) || num < 1 || num > totalPages) {
        throw new Error(`Invalid page number: ${s}`)
      }
      return num - 1 // Convert to 0-based
    })

    const newPdf = await PDFDocument.create()

    for (const pageIndex of pageIndices) {
      const [page] = await newPdf.copyPages(pdf, [pageIndex])
      newPdf.addPage(page)
    }

    const organizedPdfBytes = await newPdf.save()

    return new Response(Buffer.from(organizedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="organized.pdf"'
      }
    })
  } catch (error) {
    console.error('Error organizing PDF:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to organize PDF' }, { status: 500 })
  }
}