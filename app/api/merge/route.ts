import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length < 2) {
      return NextResponse.json({ error: 'At least 2 PDF files are required' }, { status: 400 })
    }

    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'All files must be PDF' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }

    const mergedPdfBytes = await mergedPdf.save()

    return new Response(Buffer.from(mergedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"'
      }
    })
  } catch (error) {
    console.error('Error merging PDFs:', error)
    return NextResponse.json({ error: 'Failed to merge PDFs' }, { status: 500 })
  }
}