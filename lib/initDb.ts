import mysqlLib from './mysql'
import { hashPassword } from './password'

let inited = false

export default async function ensureDbInit() {
  if (inited) return
  // if no DATABASE_URL is configured, skip init to avoid throwing during builds
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.warn('DATABASE_URL not set — skipping DB initialization')
    return
  }

  try {
    await mysqlLib.initDb()

    // seed admin user if ADMIN_USER and ADMIN_PASS are set and user missing
    try {
      const adminUser = process.env.ADMIN_USER
      const adminPass = process.env.ADMIN_PASS
      if (adminUser && adminPass) {
        const existing = await mysqlLib.getAdminUser(adminUser)
        if (!existing) {
          const hashed = hashPassword(adminPass)
          await mysqlLib.createAdminUser(adminUser, hashed)
          // eslint-disable-next-line no-console
          console.log(`Bootstrapped admin user: ${adminUser}`)
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to seed admin user:', e)
    }

    inited = true
    // intentionally quiet on success
  } catch (e) {
    // log the error server-side so deploy logs capture it
    // but don't throw to avoid crashing the app during build in environments without DB
    // (caller can retry later)
    // eslint-disable-next-line no-console
    console.error('DB init failed:', e)
  }
}
