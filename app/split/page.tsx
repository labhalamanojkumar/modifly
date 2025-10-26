import Link from 'next/link'
import Brand from '../../components/Brand'
import SplitTool from '../../components/SplitTool'

export const metadata = {
  title: 'Split PDF — Modifly',
  description: 'Split a PDF into individual pages quickly with Modifly.',
  openGraph: { title: 'Split PDF — Modifly', description: 'Split a PDF into individual pages quickly.' }
}

export default function SplitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Split PDF",
    description: "Extract pages from a PDF into separate files.",
    step: [
      {"@type": "HowToStep", name: "Select a file", text: "Choose a PDF file to split."},
      {"@type": "HowToStep", name: "Choose options", text: "Pick pages or split all pages."},
      {"@type": "HowToStep", name: "Download", text: "Download the resulting ZIP containing split pages."}
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gray-50">
      {/* Header provided by global SiteHeader component in app/layout.tsx */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Split PDF</h1>
          <p className="mt-4 text-lg text-gray-600">Split a PDF into individual pages</p>
        </div>

        <SplitTool />

        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold mb-3">Split PDFs — why it matters</h2>
            <p className="text-gray-600">Splitting a PDF into parts is useful when sharing only specific pages, extracting attachments, or preparing documents for separate reviewers. Modifly gives you a simple interface to split by page ranges or extract every page as its own file. The process is fast, secure, and designed to preserve page fidelity.</p>

            <h3 className="mt-6 text-lg font-semibold">When to split</h3>
            <p className="text-gray-600">Use splitting when you need to send only a subset of pages, extract a chapter from a long manual, or create per-page images for archiving. Splitting is also useful for redaction workflows where you edit a page and then reassemble documents later.</p>

            <h3 className="mt-6 text-lg font-semibold">How to split</h3>
            <ol className="list-decimal list-inside text-gray-600 mt-3 space-y-2">
              <li>Upload a PDF file using the file picker above.</li>
              <li>Choose whether to split all pages or select specific page ranges.</li>
              <li>Download the ZIP file containing individual pages or selected splits.</li>
            </ol>

            <figure className="mt-6">
              <img src="/samples/split-demo.svg" alt="Split demo" className="w-full rounded border" />
              <figcaption className="text-xs text-gray-500 mt-2">Demo: extracting pages into separate files.</figcaption>
            </figure>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
        </div>
      </div>
    </main>
    </>
  )
}