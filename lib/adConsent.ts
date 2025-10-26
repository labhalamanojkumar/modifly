"use client"

export function getAdConsent(): 'granted' | 'denied' | null {
  try {
    const v = localStorage.getItem('modifly_ad_consent')
    if (v === 'granted') return 'granted'
    if (v === 'denied') return 'denied'
    return null
  } catch (e) {
    return null
  }
}

export function setAdConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem('modifly_ad_consent', value)
  } catch (e) {
    // ignore
  }
}
