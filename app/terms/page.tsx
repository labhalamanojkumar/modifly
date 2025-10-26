import React from 'react'

export const metadata = {
  title: 'Terms of Service — Modifly',
  description: 'Terms of service for Modifly — usage, limits, and liability.',
}

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">By using Modifly you agree to these terms. Use the tools responsibly and only on documents you own or have permission to modify.</p>

      <h2 className="text-xl font-semibold mt-6">Usage limits</h2>
      <p className="mb-4">We may enforce usage limits to protect the service. Automated or excessive usage may be blocked.</p>

  <h2 className="text-xl font-semibold mt-6">Disclaimer</h2>
  <p className="mb-4">Modifly provides tools &quot;as-is&quot; and is not responsible for data loss. Keep backups of important files.</p>

      <h2 className="text-xl font-semibold mt-6">Contact</h2>
      <p>Questions? Contact <a href="mailto:terms@testcraft.in" className="text-blue-600">terms@testcraft.in</a>.</p>
    </main>
  )
}
