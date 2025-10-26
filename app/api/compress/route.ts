import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)

    // Basic compression by saving with reduced options
    const compressedPdfBytes = await pdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
    })

    return new Response(Buffer.from(compressedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="compressed.pdf"'
      }
    })
  } catch (error) {
    console.error('Error compressing PDF:', error)
    return NextResponse.json({ error: 'Failed to compress PDF' }, { status: 500 })
  }
}