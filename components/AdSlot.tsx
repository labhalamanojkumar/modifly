"use client"

import { useEffect, useState } from 'react'
import { getAdConsent } from '../lib/adConsent'

export default function AdSlot({ className = 'w-full h-28' }: { className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [consent, setConsent] = useState<'granted' | 'denied' | null>(null)

  useEffect(() => {
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
    const requireConsent = process.env.NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT === 'true'
    if (!client) return

    const stored = getAdConsent()
    setConsent(stored)

    // only auto-load script if consent is granted OR consent is not required
    const shouldLoad = stored === 'granted' || !requireConsent
    if (!shouldLoad) return

    // insert AdSense script once
    if (!(window as any)._adsense_loaded) {
      const s = document.createElement('script')
      s.async = true
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
      s.crossOrigin = 'anonymous'
      document.head.appendChild(s)
      ;(window as any)._adsense_loaded = true
    }

    try {
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
      setLoaded(true)
    } catch (e) {
      // ignore
    }
  }, [])

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT || '1234567890'

  if (!client) {
    return (
      <div className={`${className} bg-gray-100 border rounded flex items-center justify-center text-gray-500`}>
        Ad slot (set NEXT_PUBLIC_ADSENSE_CLIENT to enable)
      </div>
    )
  }

  return (
    <div className={className}>
      <ins className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
      {!loaded && (
        <div className="text-xs text-gray-400 text-center mt-1">Ads will load after consent or when allowed.</div>
      )}
    </div>
  )
}
