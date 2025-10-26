import mysql from 'mysql2/promise'
import { isIP } from 'net'

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL || ''
    if (!url) throw new Error('DATABASE_URL is not set')
    const u = new URL(url)
    // extract ssl-mode before deleting
    const sslMode = u.searchParams.get('ssl-mode')
    u.searchParams.delete('ssl-mode')
    const opts: any = {
      host: u.hostname,
      port: u.port ? Number(u.port) : undefined,
      user: decodeURIComponent(u.username || ''),
      password: decodeURIComponent(u.password || ''),
      database: u.pathname ? u.pathname.replace(/^\//, '') : undefined,
    }

    // handle ssl-mode mapping
    if (sslMode) {
      const m = String(sslMode).toLowerCase()
      if (m === 'required') {
        // require SSL but don't validate certificate
        opts.ssl = { rejectUnauthorized: false }
      } else {
        // for VERIFY_CA/VERIFY_IDENTITY and others, enforce cert validation
        opts.ssl = { rejectUnauthorized: true }
      }
    }

    // copy remaining search params as options (strings)
    u.searchParams.forEach((value, key) => {
      // avoid overwriting core options
      if (!['host', 'port', 'user', 'password', 'database'].includes(key)) {
        opts[key] = value
      }
    })

    pool = mysql.createPool(opts)
  }
  return pool!
}

export async function initDb() {
  const p = getPool()
  // Create tables if they don't exist
  await p.query(`
    CREATE TABLE IF NOT EXISTS admin_config (
      id INT PRIMARY KEY,
      ga VARCHAR(255),
      adsense VARCHAR(255)
    ) ENGINE=InnoDB;
  `)
  await p.query(`
    INSERT INTO admin_config (id, ga, adsense)
    VALUES (1, '', '')
    ON DUPLICATE KEY UPDATE id=id;
  `)

  await p.query(`
    CREATE TABLE IF NOT EXISTS analytics_counters (
      name VARCHAR(100) PRIMARY KEY,
      value BIGINT DEFAULT 0
    ) ENGINE=InnoDB;
  `)
  await p.query(`
    INSERT INTO analytics_counters (name, value) VALUES ('visits', 0) ON DUPLICATE KEY UPDATE name=name;
  `)

  await p.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(100),
      payload JSON,
      ts DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `)

  await p.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE,
      password_hash VARCHAR(512),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `)

  await p.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      token VARCHAR(512) UNIQUE,
      username VARCHAR(100),
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `)
}

export async function createAdminUser(username: string, passwordHash?: string) {
  const p = getPool()
  if (passwordHash) {
    await p.query('INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), username = username', [username, passwordHash])
  } else {
    await p.query('INSERT INTO admin_users (username) VALUES (?) ON DUPLICATE KEY UPDATE username = username', [username])
  }
}

export async function listAdminUsers() {
  const p = getPool()
  const [rows] = await p.query('SELECT id, username, created_at FROM admin_users ORDER BY created_at DESC')
  return rows
}

export async function getAdminUser(username: string) {
  const p = getPool()
  const [rows] = await p.query('SELECT id, username, password_hash, created_at FROM admin_users WHERE username = ? LIMIT 1', [username])
  // @ts-ignore
  return (rows && rows[0]) || null
}

export async function updateAdminUserPassword(username: string, passwordHash: string) {
  const p = getPool()
  await p.query('UPDATE admin_users SET password_hash = ? WHERE username = ?', [passwordHash, username])
}

export async function deleteAdminUser(username: string) {
  const p = getPool()
  await p.query('DELETE FROM admin_users WHERE username = ?', [username])
}

export async function storeRefreshToken(token: string, username: string, expiresAt: string) {
  const p = getPool()
  await p.query('INSERT INTO refresh_tokens (token, username, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = token', [token, username, expiresAt])
}

export async function revokeRefreshToken(token: string) {
  const p = getPool()
  await p.query('DELETE FROM refresh_tokens WHERE token = ?', [token])
}

export async function findRefreshToken(token: string) {
  const p = getPool()
  const [rows] = await p.query('SELECT token, username, expires_at FROM refresh_tokens WHERE token = ?', [token])
  // @ts-ignore
  return rows && rows[0]
}

export async function getAdminConfig() {
  const p = getPool()
  const [rows] = await p.query('SELECT ga, adsense FROM admin_config WHERE id = 1')
  // @ts-ignore
  return (rows && rows[0]) || { ga: '', adsense: '' }
}

export async function setAdminConfig(ga?: string, adsense?: string) {
  const p = getPool()
  const current = await getAdminConfig()
  const newGa = ga ?? current.ga
  const newAds = adsense ?? current.adsense
  await p.query('UPDATE admin_config SET ga = ?, adsense = ? WHERE id = 1', [newGa, newAds])
  return { ga: newGa, adsense: newAds }
}

export async function getAnalytics() {
  const p = getPool()
  const [rows] = await p.query('SELECT name, value FROM analytics_counters')
  // @ts-ignore
  const counters = rows.reduce((acc: any, r: any) => ({ ...acc, [r.name]: Number(r.value) }), {})
  const [events] = await p.query('SELECT id, type, payload, ts FROM analytics_events ORDER BY ts DESC LIMIT 200')
  // @ts-ignore
  return { visits: counters.visits || 0, events }
}

export async function postEvent(event: any) {
  const p = getPool()
  if (event.type === 'visit') {
    await p.query("INSERT INTO analytics_counters (name, value) VALUES ('visits', 1) ON DUPLICATE KEY UPDATE value = value + 1")
    return
  }
  const payload = JSON.stringify(event.payload || {})
  await p.query('INSERT INTO analytics_events (type, payload) VALUES (?, ?)', [event.type || 'event', payload])
}

const mysqlLib = {
  initDb,
  getAdminConfig,
  setAdminConfig,
  getAnalytics,
  postEvent,
  createAdminUser,
  listAdminUsers,
  getAdminUser,
  updateAdminUserPassword,
  deleteAdminUser,
  storeRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
}

export default mysqlLib
