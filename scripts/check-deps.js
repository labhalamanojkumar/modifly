const { execSync } = require('child_process')

function check(cmd) {
  try {
    execSync(`${cmd} -version`, { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

console.log('Checking system image dependencies...')
const hasMagick = check('magick') || check('convert')
const hasGifsicle = check('gifsicle')
const hasSoffice = check('soffice')

console.log('ImageMagick (magick/convert):', hasMagick ? 'found' : 'missing')
console.log('gifsicle:', hasGifsicle ? 'found' : 'missing')
console.log('LibreOffice (soffice):', hasSoffice ? 'found' : 'missing')

if (!hasMagick && !hasGifsicle) {
  console.warn('\nNo GIF processing binaries found. Install ImageMagick or gifsicle to enable GIF endpoints. See README.md for instructions.')
  process.exitCode = 2
}

if (!hasSoffice) {
  console.warn('\nLibreOffice (soffice) not found. Installing LibreOffice enables Office <-> PDF conversions (word/excel/powerpoint). See README.md for instructions to install soffice on your OS.')
  process.exitCode = 3
}
