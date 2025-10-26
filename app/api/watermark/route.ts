import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, degrees } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const text = formData.get('text') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Please provide watermark text' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)

    const pages = pdf.getPages()

    pages.forEach(page => {
      const { width, height } = page.getSize()
      page.drawText(text, {
        x: width / 2 - (text.length * 6), // Rough centering
        y: height / 2,
        size: 50,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.3,
        rotate: degrees(45),
      })
    })

    const watermarkedPdfBytes = await pdf.save()

    return new Response(Buffer.from(watermarkedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="watermarked.pdf"'
      }
    })
  } catch (error) {
    console.error('Error watermarking PDF:', error)
    return NextResponse.json({ error: 'Failed to watermark PDF' }, { status: 500 })
  }
}