import Link from 'next/link'
import Image from 'next/image'
import Brand from '../../components/Brand'

export default function ImagesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header provided by global SiteHeader component in app/layout.tsx */}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold">Image Tools</h1>
        <p className="mt-2 text-gray-600">Resize, crop, convert, compress and batch process your image files.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/images/resize" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <Image src="/samples/sample-1.svg" alt="Sample resize" className="w-full h-40 object-cover rounded-md mb-3" width={400} height={160} />
            <div className="font-semibold">Resize Images</div>
            <p className="text-sm text-gray-600">Change dimensions and DPI for web or print.</p>
          </Link>

          <Link href="/images/convert" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <Image src="/samples/sample-2.svg" alt="Sample convert" className="w-full h-40 object-cover rounded-md mb-3" width={400} height={160} />
            <div className="font-semibold">Convert Images</div>
            <p className="text-sm text-gray-600">JPEG, PNG, WebP and SVG conversions.</p>
          </Link>

          <Link href="/images/compress" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <Image src="/samples/sample-3.svg" alt="Sample compress" className="w-full h-40 object-cover rounded-md mb-3" width={400} height={160} />
            <div className="font-semibold">Compress Images</div>
            <p className="text-sm text-gray-600">Lossy and lossless compression options.</p>
          </Link>

          <Link href="/images/overlay" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <div className="w-full h-40 flex items-center justify-center rounded-md mb-3 bg-gradient-to-r from-indigo-50 to-pink-50">📎</div>
            <div className="font-semibold">Overlay & Merge</div>
            <p className="text-sm text-gray-600">Merge images, place overlays and blend modes.</p>
          </Link>

          <Link href="/images/add-text" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <div className="w-full h-40 flex items-center justify-center rounded-md mb-3 bg-gradient-to-r from-green-50 to-yellow-50">✏️</div>
            <div className="font-semibold">Add Text</div>
            <p className="text-sm text-gray-600">Add custom text with fonts and styling.</p>
          </Link>

          <Link href="/images/mask" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <div className="w-full h-40 flex items-center justify-center rounded-md mb-3 bg-gradient-to-r from-sky-50 to-violet-50">🖼️</div>
            <div className="font-semibold">Mask & Frames</div>
            <p className="text-sm text-gray-600">Apply masks, frames and custom shapes.</p>
          </Link>

          <Link href="/images/advanced" className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md">
            <div className="w-full h-40 flex items-center justify-center rounded-md mb-3 bg-gradient-to-r from-teal-50 to-cyan-50">🛠️</div>
            <div className="font-semibold">Advanced Editor</div>
            <p className="text-sm text-gray-600">Preview, rotate, enhance and control output quality before download.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
