import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const password = formData.get('password') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 })
    }

    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'Please provide a password (minimum 4 characters)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)

    const encryptedPdfBytes = await pdf.save({
      userPassword: password,
    } as any)

    return new Response(Buffer.from(encryptedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="protected.pdf"'
      }
    })
  } catch (error) {
    console.error('Error protecting PDF:', error)
    return NextResponse.json({ error: 'Failed to protect PDF' }, { status: 500 })
  }
}