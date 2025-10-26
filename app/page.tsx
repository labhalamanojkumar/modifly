import Link from 'next/link'
import Brand from '../components/Brand'
// Use a plain <img> for SVG logo to avoid image optimization issues with SVGs
import AdSlot from '../components/AdSlot'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'

export const metadata = {
  title: 'Modifly — Free Online PDF Tools — Merge, Split, Convert, Compress',
  description: 'Modifly by Testcraft.in — free online PDF tools to merge, split, convert, compress, protect and organize PDF files. Fast, private, and easy to use.',
  openGraph: {
  title: 'Modifly — Free Online PDF Tools',
  description: 'Merge, split, convert, compress and more — Modifly by Testcraft.in',
    images: ['/og-image.svg'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Modifly',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  description: 'Free online PDF tools to merge, split, convert, compress, protect and organize PDF files.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header is provided globally by `SiteHeader` in layout.tsx */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* New professional hero */}
      <Hero />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">All tools under one roof</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard title="Merge & Split PDFs" description="Combine or split PDF documents with ease." href="/merge" emoji="📄" />
            <FeatureCard title="Compress PDF" description="Reduce file size while keeping quality." href="/compress" emoji="📉" />
            <FeatureCard title="Image Tools" description="Resize, crop, convert and optimize images." href="/images" emoji="🖼️" />
            <FeatureCard title="Convert Files" description="Convert between PDF, Word, images and more." href="/convert" emoji="🔁" />
            <FeatureCard title="Protect & Unlock" description="Add or remove passwords and permissions." href="/protect" emoji="🔐" />
            <FeatureCard title="Organize & Batch" description="Reorder, extract, or batch process documents and images." href="/organize" emoji="🗂️" />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Merge PDFs', href: '/merge', desc: 'Combine multiple PDFs into one document.' },
              { title: 'Split PDF', href: '/split', desc: 'Split a PDF into separate files quickly.' },
              { title: 'Compress PDF', href: '/compress', desc: 'Reduce file size while preserving quality.' },
              { title: 'Convert PDF', href: '/convert', desc: 'Convert PDFs to Word, images, or text.' },
              { title: 'Protect', href: '/protect', desc: 'Add password protection to PDFs.' },
              { title: 'Unlock', href: '/unlock', desc: 'Remove passwords from PDFs you own.' },
            ].map((t) => (
              <article key={t.href} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md">
                <h4 className="text-lg font-semibold mb-2">{t.title}</h4>
                <p className="text-gray-600 mb-4">{t.desc}</p>
                <Link href={t.href} className="text-blue-600 font-medium">Open tool →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold">Why people use Modifly</h3>
          <p className="mt-3 text-gray-600">No sign-up. Fast processing. Files never leave your browser unless you explicitly upload them for server-side features.</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <strong className="block text-xl">Privacy</strong>
              <p className="text-gray-600 mt-2">We respect your privacy — files are processed locally when possible.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <strong className="block text-xl">Speed</strong>
              <p className="text-gray-600 mt-2">Optimized processing so you get results quickly.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <strong className="block text-xl">Free</strong>
              <p className="text-gray-600 mt-2">Core tools available for free to all users.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold">Testimonials</h3>
          <div className="mt-6 space-y-4">
            <blockquote className="bg-white p-6 rounded-lg shadow-sm">“Saved me hours when merging contracts — super fast and easy.” — Product Manager</blockquote>
            <blockquote className="bg-white p-6 rounded-lg shadow-sm">“Great free toolset that just works.” — Freelancer</blockquote>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold">Modifly</h4>
              <p className="text-sm text-gray-600 mt-2">Modifly provides professional PDF and image tools — merge, split, convert, compress, edit and protect files. Built by Testcraft.in.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold">Categories</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li><Link href="/files" className="text-gray-600 hover:text-gray-900">PDF Modification</Link></li>
                <li><Link href="/images" className="text-gray-600 hover:text-gray-900">Image Modification</Link></li>
                <li><Link href="/convert" className="text-gray-600 hover:text-gray-900">Conversions</Link></li>
                <li><Link href="/compress" className="text-gray-600 hover:text-gray-900">Compression</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link></li>
                <li><Link href="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} Modifly — Built by Testcraft.in</div>
        </div>
      </footer>
    </main>
  )
}