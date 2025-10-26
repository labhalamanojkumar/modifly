import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

function check(cmd: string) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

export function GET() {
  const hasMagick = check('magick') || check('convert')
  const hasGifsicle = check('gifsicle')
  const hasSoffice = check('soffice')

  return NextResponse.json({ magick: hasMagick, gifsicle: hasGifsicle, soffice: hasSoffice })
}
