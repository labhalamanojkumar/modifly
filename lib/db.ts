import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'db.json')

function ensureFile() {
  if (!fs.existsSync(path.dirname(FILE))) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true })
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(
      FILE,
      JSON.stringify({ analytics: { visits: 0, events: [], lastUpdated: '' }, admin: { ga: '', adsense: '', users: [] } }, null, 2)
    )
  }
}

export function readDb() {
  ensureFile()
  const raw = fs.readFileSync(FILE, 'utf8')
  return JSON.parse(raw)
}

export function writeDb(data: any) {
  ensureFile()
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

export default function getDb() {
  return {
    read: () => readDb(),
    write: (d: any) => writeDb(d),
    file: FILE
  }
}
