import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { execSync } from 'child_process'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import * as XLSX from 'xlsx'
import PptxGenJS from 'pptxgenjs'

const EXTERNAL_CONV_URL = process.env.EXTERNAL_CONVERSION_API_URL || process.env.CONVERSION_API_URL
const EXTERNAL_CONV_KEY = process.env.EXTERNAL_CONVERSION_API_KEY || process.env.CONVERSION_API_KEY

// Dynamic import for pdf-parse to avoid TypeScript issues
const getPdfParse = async () => {
  const mod = await import('pdf-parse')
  return mod.PDFParse
}

function hasCmd(cmd: string) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

function findPythonCmd(): string | null {
  const candidates = ['python', 'python3', 'py']
  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' })
      return cmd
    } catch (e) {
      // continue
    }
  }
  return null
}

function writeTmpFile(prefix: string, filename: string, buffer: Buffer) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  const outPath = path.join(tmp, filename)
  fs.writeFileSync(outPath, buffer)
  return { tmp, outPath }
}

async function zipFiles(filePaths: string[]) {
  const zip = new JSZip()
  for (const p of filePaths) {
    const data = fs.readFileSync(p)
    zip.file(path.basename(p), data)
  }
  return zip.generateAsync({ type: 'nodebuffer' })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as any
    const conversionType = formData.get('conversionType') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!conversionType) {
      return NextResponse.json({ error: 'No conversion type specified' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    switch (conversionType) {
      case 'pdf-to-text': {
        const pdfParse = await getPdfParse()
        const parser = new pdfParse(Buffer.from(arrayBuffer))
        const data = await parser.getText()
        return new NextResponse(data.text, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="converted.txt"'
          }
        })
      }

      case 'pdf-to-images': {
        // PDF to Images (ZIP) - removed as requires external binaries
        return NextResponse.json({ error: 'PDF to images conversion is not supported without external dependencies.' }, { status: 501 })
      }

      case 'word-to-pdf':
      case 'excel-to-pdf':
      case 'powerpoint-to-pdf':
      case 'rtf-to-pdf':
      case 'odt-to-pdf':
      case 'ods-to-pdf':
      case 'odp-to-pdf':
      case 'doc-to-pdf':
      case 'xls-to-pdf':
      case 'ppt-to-pdf':
      case 'docx-to-pdf':
      case 'xlsx-to-pdf':
      case 'pptx-to-pdf': {
        // use LibreOffice (soffice) if available
        if (!hasCmd('soffice')) {
          return NextResponse.json({ error: 'Office to PDF conversion requires LibreOffice (soffice) to be installed on the server. Please install soffice.' }, { status: 501 })
        }

        const originalName = file.name || 'input'
        const { tmp, outPath: inputPath } = writeTmpFile('modifly-', originalName, inputBuffer)
        try {
          // LibreOffice will output <basename>.pdf in outdir
          execSync(`soffice --headless --convert-to pdf --outdir "${tmp}" "${inputPath}"`, { stdio: 'ignore' })
          const pdfName = path.basename(originalName, path.extname(originalName)) + '.pdf'
          const pdfPath = path.join(tmp, pdfName)
          if (!fs.existsSync(pdfPath)) {
            return NextResponse.json({ error: 'Conversion failed: LibreOffice did not produce a PDF' }, { status: 500 })
          }
          const pdfBuf = fs.readFileSync(pdfPath)
          return new NextResponse(pdfBuf, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${pdfName}"`
            }
          })
        } finally {
          try { fs.rmSync(tmp, { recursive: true, force: true }) } catch (e) { /* ignore */ }
        }
      }

      case 'csv-to-pdf':
      case 'html-to-pdf':
      case 'txt-to-pdf':
      case 'xml-to-pdf': {
        // use LibreOffice (soffice) if available
        if (!hasCmd('soffice')) {
          return NextResponse.json({ error: 'File to PDF conversion requires LibreOffice (soffice) to be installed on the server. Please install soffice.' }, { status: 501 })
        }

        const originalName = file.name || 'input'
        const { tmp, outPath: inputPath } = writeTmpFile('modifly-', originalName, inputBuffer)
        try {
          // LibreOffice will output <basename>.pdf in outdir
          execSync(`soffice --headless --convert-to pdf --outdir "${tmp}" "${inputPath}"`, { stdio: 'ignore' })
          const pdfName = path.basename(originalName, path.extname(originalName)) + '.pdf'
          const pdfPath = path.join(tmp, pdfName)
          if (!fs.existsSync(pdfPath)) {
            return NextResponse.json({ error: 'Conversion failed: LibreOffice did not produce a PDF' }, { status: 500 })
          }
          const pdfBuf = fs.readFileSync(pdfPath)
          return new NextResponse(pdfBuf, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${pdfName}"`
            }
          })
        } finally {
          try { fs.rmSync(tmp, { recursive: true, force: true }) } catch (e) { /* ignore */ }
        }
      }

      case 'pdf-to-word': {
        // Route to Python script for better text+image extraction
        const pythonCmd = findPythonCmd()
        if (!pythonCmd) {
          return NextResponse.json({ error: 'Python is not installed or not found in PATH' }, { status: 501 })
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'modifly-py-'))
        const inputName = file.name || 'input.pdf'
        const inputPath = path.join(tmpDir, inputName)
        fs.writeFileSync(inputPath, inputBuffer)

        const outputName = path.basename(inputName, path.extname(inputName)) + '.docx'
        const outputPath = path.join(tmpDir, outputName)

        // Locate the python script
        const scriptPath = path.join(process.cwd(), 'scripts', 'pyconvert.py')
        if (!fs.existsSync(scriptPath)) {
          try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
          return NextResponse.json({ error: 'Conversion script not found on server' }, { status: 500 })
        }

        // Run python script
        const res = execSync(`${pythonCmd} "${scriptPath}" "${inputPath}" docx "${outputPath}"`, { encoding: 'utf-8' })

        if (!fs.existsSync(outputPath)) {
          try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
          return NextResponse.json({ error: 'Conversion did not produce an output file' }, { status: 500 })
        }

        const outBuf = fs.readFileSync(outputPath)
        try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}

        return new NextResponse(outBuf, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${outputName}"`
          }
        })
      }

      case 'pdf-to-excel': {
        // Route to Python script for better text+image extraction
        const pythonCmd = findPythonCmd()
        if (!pythonCmd) {
          return NextResponse.json({ error: 'Python is not installed or not found in PATH' }, { status: 501 })
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'modifly-py-'))
        const inputName = file.name || 'input.pdf'
        const inputPath = path.join(tmpDir, inputName)
        fs.writeFileSync(inputPath, inputBuffer)

        const outputName = path.basename(inputName, path.extname(inputName)) + '.xlsx'
        const outputPath = path.join(tmpDir, outputName)

        // Locate the python script
        const scriptPath = path.join(process.cwd(), 'scripts', 'pyconvert.py')
        if (!fs.existsSync(scriptPath)) {
          try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
          return NextResponse.json({ error: 'Conversion script not found on server' }, { status: 500 })
        }

        // Run python script
        const res = execSync(`${pythonCmd} "${scriptPath}" "${inputPath}" xlsx "${outputPath}"`, { encoding: 'utf-8' })

        if (!fs.existsSync(outputPath)) {
          try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
          return NextResponse.json({ error: 'Conversion did not produce an output file' }, { status: 500 })
        }

        const outBuf = fs.readFileSync(outputPath)
        try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}

        return new NextResponse(outBuf, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${outputName}"`
          }
        })
      }

      case 'pdf-to-powerpoint': {
        // Route to Python script for better text+image extraction
        const pythonCmd = findPythonCmd()
        if (!pythonCmd) {
          return NextResponse.json({ error: 'Python is not installed or not found in PATH' }, { status: 501 })
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'modifly-py-'))
        const inputName = file.name || 'input.pdf'
        const inputPath = path.join(tmpDir, inputName)
        fs.writeFileSync(inputPath, inputBuffer)

        const outputName = path.basename(inputName, path.extname(inputName)) + '.pptx'
        const outputPath = path.join(tmpDir, outputName)

        // Locate the python script
        const scriptPath = path.join(process.cwd(), 'scripts', 'pyconvert.py')
        if (!fs.existsSync(scriptPath)) {
          try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
          return NextResponse.json({ error: 'Conversion script not found on server' }, { status: 500 })
        }

        // Run python script
        const res = execSync(`${pythonCmd} "${scriptPath}" "${inputPath}" pptx "${outputPath}"`, { encoding: 'utf-8' })

        if (!fs.existsSync(outputPath)) {
          try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
          return NextResponse.json({ error: 'Conversion did not produce an output file' }, { status: 500 })
        }

        const outBuf = fs.readFileSync(outputPath)
        try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}

        return new NextResponse(outBuf, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${outputName}"`
          }
        })
      }

      case 'images-to-pdf': {
        // Images to PDF
        const pdfDoc = await PDFDocument.create()
        const imageBytes = Buffer.from(arrayBuffer)

        // Determine image type and embed
        let image
        if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes)
        } else {
          return NextResponse.json({ error: 'Unsupported image format. Please use PNG or JPEG.' }, { status: 400 })
        }

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })

        const pdfBytes = await pdfDoc.save()
        return new NextResponse(Buffer.from(pdfBytes), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="converted.pdf"'
          }
        })
      }

      case 'text-to-pdf': {
        // Text to PDF
        const text = new TextDecoder().decode(arrayBuffer)
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()

        page.drawText(text, {
          x: 50,
          y: height - 50,
          size: 12,
          maxWidth: width - 100,
        })

        const pdfBytes = await pdfDoc.save()
        return new NextResponse(Buffer.from(pdfBytes), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="converted.pdf"'
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Unsupported conversion type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error converting file:', error)
    return NextResponse.json({ error: 'Failed to convert file' }, { status: 500 })
  }
}