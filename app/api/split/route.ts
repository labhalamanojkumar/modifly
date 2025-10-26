import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pageCount = pdf.getPageCount()

    const zip = new JSZip()

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create()
      const [page] = await newPdf.copyPages(pdf, [i])
      newPdf.addPage(page)

      const pdfBytes = await newPdf.save()
      zip.file(`page_${i + 1}.pdf`, pdfBytes)
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })

    return new Response(zipContent as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="split_pages.zip"'
      }
    })
  } catch (error) {
    console.error('Error splitting PDF:', error)
    return NextResponse.json({ error: 'Failed to split PDF' }, { status: 500 })
  }
}