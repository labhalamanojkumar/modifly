import mysqlLib from '../../../../lib/mysql'
import { getAuthFromRequestCookies } from '../../../../lib/middleware'
import { hashPassword } from '../../../../lib/password'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const adminConfigPath = path.join(process.cwd(), 'data', 'admin.json')

function readAdminConfig() {
  try {
    const data = fs.readFileSync(adminConfigPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading admin config:', error)
    return { users: [] }
  }
}

function writeAdminConfig(config: any) {
  try {
    fs.writeFileSync(adminConfigPath, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('Error writing admin config:', error)
  }
}

export async function GET(req: Request) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  try {
    if (!process.env.DATABASE_URL) {
      const config = readAdminConfig()
      return new Response(JSON.stringify({ ok: true, users: config.users || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const users = await mysqlLib.listAdminUsers()
    return new Response(JSON.stringify({ ok: true, users }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  try {
    const { username, password } = await req.json()
    if (!process.env.DATABASE_URL) {
      const config = readAdminConfig()
      const hashed = hashPassword(password)
      config.users = config.users || []
      config.users.push({ username, password_hash: hashed, created_at: new Date().toISOString() })
      writeAdminConfig(config)
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const hashed = hashPassword(password)
    await mysqlLib.createAdminUser(username, hashed)
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function PUT(req: Request) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  try {
    const { username, password } = await req.json()
    if (!process.env.DATABASE_URL) {
      const config = readAdminConfig()
      const hashed = hashPassword(password)
      config.users = config.users || []
      const user = config.users.find((u: any) => u.username === username)
      if (user) user.password_hash = hashed
      writeAdminConfig(config)
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const hashed = hashPassword(password)
    await mysqlLib.updateAdminUserPassword(username, hashed)
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function DELETE(req: Request) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  try {
    const { username } = await req.json()
    if (!process.env.DATABASE_URL) {
      const config = readAdminConfig()
      config.users = config.users || []
      config.users = config.users.filter((u: any) => u.username !== username)
      writeAdminConfig(config)
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    await mysqlLib.deleteAdminUser(username)
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
