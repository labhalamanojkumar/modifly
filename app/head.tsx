import fs from 'fs'
import path from 'path'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const ENV_GA = process.env.NEXT_PUBLIC_GA_ID || ''
const ENV_ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

function getAdminConfig() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'admin.json')
    const data = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

export default async function Head() {
  const conf = getAdminConfig()
  let GA_ID = ENV_GA
  let ADSENSE_CLIENT = ENV_ADSENSE
  let MONETAG_CONTENT = ''
  let MONETAG_ENABLED = false

  if (conf) {
    GA_ID = conf.ga || GA_ID
    ADSENSE_CLIENT = conf.adsense?.client || ADSENSE_CLIENT
    MONETAG_CONTENT = conf.monetag?.content || ''
    MONETAG_ENABLED = conf.monetag?.enabled || false
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'Modifly',
    publisher: {
      '@type': 'Organization',
      name: 'Testcraft.in',
      url: 'https://testcraft.in',
    },
  }

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Modifly — Free PDF Tools</title>
  <meta name="description" content="Modifly by Testcraft.in — free online PDF tools to merge, split, convert, compress and more. No signup required." />
      <meta name="keywords" content="free pdf tools, merge pdf, split pdf, convert pdf, compress pdf, watermark pdf" />
  <meta property="og:title" content="Modifly — Free PDF Tools" />
  <meta property="og:description" content="Modifly by Testcraft.in — free online PDF tools to merge, split, convert, compress and more. No signup required." />
      <meta property="og:image" content="/og-image.svg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ec4899" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
      <link rel="canonical" href={SITE_URL} />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
      <link rel="icon" href="/favicon.ico" />
      <meta name="robots" content="index,follow" />

      {MONETAG_ENABLED && MONETAG_CONTENT && (
        <meta name="monetag" content={MONETAG_CONTENT} />
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Google Analytics (GA4) - gtag.js */}
      {GA_ID ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}', { page_path: window.location.pathname });` }} />
        </>
      ) : null}

      {/* Google AdSense */}
      {ADSENSE_CLIENT ? (
        <script data-ad-client={ADSENSE_CLIENT} async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" />
      ) : null}
    </>
  )
}
