import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getAuthFromRequestCookies } from '../../../../lib/middleware'

const analyticsPath = path.join(process.cwd(), 'data', 'analytics.json')

function readAnalytics() {
  try {
    const data = fs.readFileSync(analyticsPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading analytics:', error)
    return { events: [] }
  }
}

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequestCookies(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const analytics = readAnalytics()
  const events = analytics.events || []

  // Generate CSV
  const csvHeader = 'timestamp,tool,event\n'
  const csvRows = events.map((event: any) =>
    `${event.timestamp},${event.tool},${event.event}`
  ).join('\n')
  const csv = csvHeader + csvRows

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="analytics-report.csv"'
    }
  })
}