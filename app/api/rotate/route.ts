import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, degrees } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const rotation = parseInt(formData.get('rotation') as string) || 90

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 })
    }

    if (![90, 180, 270].includes(rotation)) {
      return NextResponse.json({ error: 'Rotation must be 90, 180, or 270 degrees' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)

    const pages = pdf.getPages()
    pages.forEach(page => {
      const currentRotation = page.getRotation().angle
      page.setRotation(degrees(currentRotation + rotation))
    })

    const rotatedPdfBytes = await pdf.save()

    return new Response(Buffer.from(rotatedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rotated.pdf"'
      }
    })
  } catch (error) {
    console.error('Error rotating PDF:', error)
    return NextResponse.json({ error: 'Failed to rotate PDF' }, { status: 500 })
  }
}