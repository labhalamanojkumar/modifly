const { execSync } = require('child_process')
const path = require('path')

console.log('Running quick project checks...')

try {
  console.log('\n1) Lint (warnings allowed)...')
  execSync('npm run lint -- --max-warnings=0', { stdio: 'inherit' })
} catch (e) {
  console.error('Lint failed.'); process.exit(2)
}

console.log('\n2) Check system deps (non-fatal)')
try { execSync('npm run check-deps', { stdio: 'inherit' }) } catch (e) { console.warn('check-deps reported missing binaries (non-fatal)') }

console.log('\nQuick tests completed.')
