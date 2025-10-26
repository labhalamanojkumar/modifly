// Server-only: quietly ignore Node's DEP0123 TLS ServerName deprecation warning
// This is a targeted, temporary mitigation. Long-term fix: use a hostname (not an IP) in DATABASE_URL.
let registered = false
export default function suppressDep0123() {
  if (registered) return
  if (typeof process === 'undefined' || !process || !process.on) return
  const handler = (warning: any) => {
    try {
      if (warning && warning.code === 'DEP0123') {
        // ignore this specific deprecation warning
        return
      }
    } catch (e) {
      // fallback: let default behavior run
    }
    // fallback: print same as Node would
    // eslint-disable-next-line no-console
    console.warn(warning)
  }
  process.on('warning', handler)
  registered = true
}
