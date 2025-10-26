import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="absolute -right-40 -top-20 opacity-20 pointer-events-none">
        <svg width="560" height="560" viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="280" cy="280" r="200" fill="url(#g)" />
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0" stopColor="#6366F1" stopOpacity="0.9" />
              <stop offset="1" stopColor="#F472B6" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">Modifly — Professional PDF, Image and File Tools</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">A single platform to edit, convert and secure your documents and images — fast, private and built for professionals. From PDF merge/split to image resize, convert and batch processing, Modifly has it under one roof.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/merge" className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">Try Merge</Link>
              <Link href="/images" className="inline-flex items-center px-5 py-3 border border-transparent text-indigo-700 bg-white rounded-md shadow-sm hover:bg-indigo-50">Image Tools</Link>
              <Link href="/files" className="inline-flex items-center px-5 py-3 border border-transparent text-indigo-700 bg-white rounded-md shadow-sm hover:bg-indigo-50">File Tools</Link>
            </div>
          </div>

            <div className="hidden md:block animate-float">
              <Image src="/hero-graphic.svg" alt="Modifly illustration" width={520} height={420} className="w-full h-auto rounded-lg shadow-lg transform-gpu" />
            </div>
        </div>
      </div>
    </section>
  )
}
