import React from 'react'

export const metadata = {
  title: 'Privacy Policy — Modifly',
  description: 'Privacy policy for Modifly — how we handle data, cookies and ads.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Modifly respects your privacy. This page explains how we collect and use data on this website.</p>

      <h2 className="text-xl font-semibold mt-6">Ads and third-party services</h2>
      <p className="mb-4">We may show ads served by third-party networks (for example Google AdSense). These providers may use cookies and collect information to serve personalized ads. To use personalized ads you must have an account with the provider and follow their setup instructions. We do not share your uploaded files with ad providers.</p>

      <h2 className="text-xl font-semibold mt-6">Cookies</h2>
      <p className="mb-4">We use cookies and local storage only when necessary for features such as preferences or for third-party services. If you prefer not to receive personalized ads, change your ad settings at your ad network provider or use ad-blocking software.</p>

      <h2 className="text-xl font-semibold mt-6">Contact</h2>
      <p>If you have questions about this policy, contact us at <a href="mailto:privacy@testcraft.in" className="text-blue-600">privacy@testcraft.in</a>.</p>
    </main>
  )
}
