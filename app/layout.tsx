import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteHeader from '../components/SiteHeader'
import ConsentBanner from '../components/ConsentBanner'
import Analytics from '../components/Analytics'
import suppressDep0123 from '../lib/suppressDep0123'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Modifly — Free PDF Tools',
  description: 'Modifly by Testcraft.in — free online PDF tools to merge, split, convert, compress, protect, unlock, rotate, watermark and organize PDFs.',
  keywords: ['PDF', 'merge PDF', 'split PDF', 'compress PDF', 'PDF converter', 'free PDF tools', 'Testcraft.in'],
  authors: [{ name: 'Testcraft.in', url: 'https://testcraft.in' }],
  applicationName: 'Modifly',
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL('http://localhost:3000'),
  openGraph: {
  title: 'Modifly — Free PDF Tools',
  description: 'Free online PDF tools by Testcraft.in: merge, split, convert, compress and more. No signup required.',
    url: 'https://example.com',
  siteName: 'Modifly',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
  alt: 'Modifly — Free PDF Tools'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
  title: 'Modifly — Free PDF Tools',
    description: 'Free online PDF tools by Testcraft.in — merge, split, convert, compress and more.',
    images: ['/og-image.svg']
  },
  icons: {
    icon: '/og-image.svg',
    shortcut: '/og-image.svg',
    apple: '/og-image.svg'
  }
}

// Dedicated exports to satisfy Next.js metadata expectations (avoid warnings)
export const viewport = { width: 'device-width', initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // suppress known Node.js deprecation that arises when DATABASE_URL uses an IP
  // this is a targeted mitigation; prefer using a hostname in DATABASE_URL
  suppressDep0123()
  return (
    <html lang="en">
      <head>
        {/* Basic SEO / indexing hints */}
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#ffffff" />
        {/* Preconnect to improve resource loading (fonts, ads, analytics) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        {/* Optional Google site verification (set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        ) : null}
        {/* JSON-LD Organization (helps rich results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: metadata.title,
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-image.svg`,
            }),
          }}
        />
      </head>
      <body className={inter.className}>
  <SiteHeader />
  <ConsentBanner />
  <Analytics />
  {children}
        <footer className="w-full bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
            Modifly — Professional PDF & Image tools. Built by Testcraft.in
          </div>
        </footer>
      </body>
    </html>
  )
}
