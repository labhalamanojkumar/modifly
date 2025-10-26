import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync, execSync } from 'child_process'

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

function contentTypeForFormat(fmt: string) {
  switch (fmt) {
    case 'txt':
      return 'text/plain'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    default:
      return 'application/octet-stream'
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as any
    const conversionType = (formData.get('conversionType') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!conversionType) {
      return NextResponse.json({ error: 'No conversion type specified' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    const pythonCmd = findPythonCmd()
    if (!pythonCmd) {
      return NextResponse.json({ error: 'Python is not installed or not found in PATH. Install Python 3 and ensure `python` or `python3` is available.' }, { status: 501 })
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'modifly-py-'))
    const inputName = file.name || 'input.pdf'
    const inputPath = path.join(tmpDir, inputName)
    fs.writeFileSync(inputPath, inputBuffer)

    // Determine desired format identifier for script (txt, docx, xlsx, pptx)
    let fmt = ''
    switch (conversionType) {
      case 'pdf-to-text': fmt = 'txt'; break
      case 'pdf-to-word': fmt = 'docx'; break
      case 'pdf-to-excel': fmt = 'xlsx'; break
      case 'pdf-to-powerpoint': fmt = 'pptx'; break
      default:
        // unsupported here
        try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
        return NextResponse.json({ error: 'Unsupported conversion type for Python fallback' }, { status: 400 })
    }

    const outputName = path.basename(inputName, path.extname(inputName)) + '.' + fmt
    const outputPath = path.join(tmpDir, outputName)

    // Locate the python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'pyconvert.py')
    if (!fs.existsSync(scriptPath)) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
      return NextResponse.json({ error: 'Conversion script not found on server' }, { status: 500 })
    }

    // Run python script
    const res = spawnSync(pythonCmd, [scriptPath, inputPath, fmt, outputPath], { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })

    if (res.error) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
      return NextResponse.json({ error: `Failed to execute Python: ${String(res.error)}` }, { status: 500 })
    }

    if (res.status !== 0) {
      const stderr = (res.stderr || '').toString()
      const stdout = (res.stdout || '').toString()
      // If script printed a MISSING: marker, include helpful message
      if (stderr && stderr.includes('MISSING')) {
        const pkgNote = stderr.trim()
        const hint = 'Python packages missing. Ensure dependencies are installed: pymupdf python-docx openpyxl python-pptx. Run: pip install pymupdf python-docx openpyxl python-pptx'
        try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
        return NextResponse.json({ error: 'Conversion failed: ' + pkgNote, hint }, { status: 500 })
      }
      try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
      return NextResponse.json({ error: 'Conversion script failed', details: { stderr, stdout, status: res.status } }, { status: 500 })
    }

    if (!fs.existsSync(outputPath)) {
      // Debug: list what files were created
      const filesInDir = fs.readdirSync(tmpDir)
      try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
      return NextResponse.json({ error: 'Conversion did not produce an output file', debug: { expectedPath: outputPath, filesCreated: filesInDir, pythonStdout: res.stdout, pythonStderr: res.stderr } }, { status: 500 })
    }

    const outBuf = fs.readFileSync(outputPath)
    const ct = contentTypeForFormat(fmt)
    const filename = outputName

    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}

    return new NextResponse(outBuf, {
      headers: {
        'Content-Type': ct,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
