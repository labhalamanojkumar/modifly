import Link from 'next/link'
import Brand from './Brand'

export default function SiteHeader() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <Brand />
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/files" className="text-gray-700 hover:text-gray-900 font-medium">PDF Modification</Link>
            <Link href="/images" className="text-gray-700 hover:text-gray-900 font-medium">Image Modification</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
