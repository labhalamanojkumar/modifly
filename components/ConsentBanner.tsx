"use client"

import { useEffect, useState } from 'react'

export default function ConsentBanner() {
  const [consent, setConsent] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('modifly_ad_consent')
      setConsent(stored)
    } catch (e) {
      setConsent(null)
    }
  }, [])

  const giveConsent = () => {
    try {
      localStorage.setItem('modifly_ad_consent', 'granted')
      setConsent('granted')
      // attempt to push ads if available
      try {
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
      } catch (e) {
        // ignore
      }
    } catch (e) {
      setConsent('granted')
    }
  }

  const denyConsent = () => {
    try {
      localStorage.setItem('modifly_ad_consent', 'denied')
      setConsent('denied')
    } catch (e) {
      setConsent('denied')
    }
  }

  if (consent) return null

  return (
    <div className="fixed bottom-4 right-4 left-4 max-w-3xl mx-auto z-50">
      <div className="bg-white border rounded shadow-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-700">We use ads to support this site. Do you allow personalized ads on this device?</div>
        <div className="flex gap-2">
          <button onClick={denyConsent} className="px-3 py-2 bg-gray-100 rounded">Reject</button>
          <button onClick={giveConsent} className="px-3 py-2 bg-blue-600 text-white rounded">Accept</button>
        </div>
      </div>
    </div>
  )
}
