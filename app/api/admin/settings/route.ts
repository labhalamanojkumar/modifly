import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getAuthFromRequestCookies } from '../../../../lib/middleware'

const adminConfigPath = path.join(process.cwd(), 'data', 'admin.json')

function readAdminConfig() {
  try {
    const data = fs.readFileSync(adminConfigPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading admin config:', error)
    return null
  }
}

function writeAdminConfig(config: any) {
  try {
    fs.writeFileSync(adminConfigPath, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('Error writing admin config:', error)
    return false
  }
}

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = readAdminConfig()
  if (!config) {
    return NextResponse.json({ error: 'Config not found' }, { status: 500 })
  }

  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await req.json()
    const config = readAdminConfig()
    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 500 })
    }

    // Merge updates
    const updatedConfig = { ...config, ...updates }

    if (writeAdminConfig(updatedConfig)) {
      return NextResponse.json({ success: true, config: updatedConfig })
    } else {
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}