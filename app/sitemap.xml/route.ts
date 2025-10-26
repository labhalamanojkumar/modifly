import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const routes = [
  '/',
  '/merge',
  '/split',
  '/compress',
  '/convert',
  '/protect',
  '/unlock',
  '/rotate',
  '/watermark',
  '/organize',
  '/admin',
  '/privacy',
  '/terms',
  '/images',
  '/images/advanced',
  '/files'
]

export async function GET() {
  const urls = routes.map((route) => {
    return `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  }).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`

  return new NextResponse(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  })
}
