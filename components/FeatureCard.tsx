import React from 'react'
import Link from 'next/link'

export default function FeatureCard({ title, description, href, emoji }: { title: string; description: string; href: string; emoji?: string }) {
  return (
    <Link href={href} className="block bg-white rounded-xl shadow-sm hover:shadow-md p-6 h-full">
      <div className="flex items-start gap-4">
        <div className="feature-icon mr-3">
          <div className="text-2xl" aria-hidden>{emoji || '🧰'}</div>
        </div>
        <div>
          <h4 className="text-lg font-semibold">{title}</h4>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}
