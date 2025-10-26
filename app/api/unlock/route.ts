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

    if (!password) {
      return NextResponse.json({ error: 'Please provide the password' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()

    // Try to load with password
    let pdf: PDFDocument
    try {
      pdf = await PDFDocument.load(arrayBuffer, { password } as any)
    } catch (error) {
      return NextResponse.json({ error: 'Incorrect password or file is not password protected' }, { status: 400 })
    }

    // Save without encryption
    const unlockedPdfBytes = await pdf.save()

    return new Response(Buffer.from(unlockedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="unlocked.pdf"'
      }
    })
  } catch (error) {
    console.error('Error unlocking PDF:', error)
    return NextResponse.json({ error: 'Failed to unlock PDF' }, { status: 500 })
  }
}