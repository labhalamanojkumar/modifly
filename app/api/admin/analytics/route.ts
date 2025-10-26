import fs from 'fs'
import path from 'path'
import { getAuthFromRequestCookies } from '../../../../lib/middleware'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  // require auth
  const auth = getAuthFromRequestCookies(req)
  if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })

  try {
    const p = path.join(process.cwd(), 'data', 'analytics.json')
    const raw = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '{}'
    const data = JSON.parse(raw || '{}')

    // compute some simple metrics
    const visits = data.visits || 0
    const events = Array.isArray(data.events) ? data.events : []
    const eventsByTool: Record<string, number> = {}
    for (const ev of events) {
      const tool = ev.tool || 'unknown'
      eventsByTool[tool] = (eventsByTool[tool] || 0) + 1
    }

    const resp = {
      visits,
      totalEvents: events.length,
      eventsByTool,
      lastUpdated: data.lastUpdated || null,
    }
    return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500 })
  }
}
