"use client"

import { useEffect } from 'react'
import { getAdConsent } from '../lib/adConsent'

export default function Analytics() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!id) return

    const requireConsent = process.env.NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT === 'true'
    const consent = getAdConsent()
    if (requireConsent && consent !== 'granted') return

    // inject gtag.js
    if (!(window as any)._gtag_loaded) {
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
      document.head.appendChild(s)

      const inline = document.createElement('script')
      inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${id}', { anonymize_ip: true });`
      document.head.appendChild(inline)
      ;(window as any)._gtag_loaded = true
    }
  }, [])

  return null
}
