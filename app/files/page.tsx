import Link from 'next/link'
import Brand from '../../components/Brand'

export default function FilesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header provided by global SiteHeader component in app/layout.tsx */}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold">File Tools</h1>
        <p className="mt-2 text-gray-600">Convert, optimize and manage document files including PDFs, Word and images.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/convert" className="block bg-white p-6 rounded-lg shadow-sm">Convert Files</Link>
          <Link href="/merge" className="block bg-white p-6 rounded-lg shadow-sm">Batch / Merge PDFs</Link>
          <Link href="/split" className="block bg-white p-6 rounded-lg shadow-sm">Split / Archive Pages</Link>
          <Link href="/organize" className="block bg-white p-6 rounded-lg shadow-sm">Organize / Reorder Pages</Link>
        </div>
      </div>
    </main>
  )
}
