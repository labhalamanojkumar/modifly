import ImageEditor from '../../../components/ImageEditor'
import Link from 'next/link'

export const metadata = {
  title: 'Advanced Image Tools — Modifly',
  description: 'Rotate, enhance, preview and fine-tune images with Modifly — client and server powered image editing tools.',
  openGraph: { title: 'Advanced Image Tools — Modifly', description: 'Rotate, enhance, preview and fine-tune images with Modifly.' }
}

export default function AdvancedImagesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">Advanced Image Tools</h1>
          <p className="mt-2 text-gray-600">Preview and modify images before downloading — rotate, sharpen, normalize, and control output quality.</p>
        </div>

        <section className="py-4">
          <ImageEditor />
        </section>

        <div className="mt-8 text-center">
          <Link href="/images" className="text-blue-600 hover:text-blue-800">← Back to Image Tools</Link>
        </div>
      </div>
    </main>
  )
}
