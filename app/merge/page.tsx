
import Link from 'next/link'
import MergeTool from '../../components/MergeTool'

export const metadata = {
  title: 'Merge PDFs — Modifly',
  description: 'Combine multiple PDF files into a single document quickly and securely with Modifly.',
  openGraph: { title: 'Merge PDFs — Modifly', description: 'Combine multiple PDF files into a single document quickly and securely.' }
}

export default function MergePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Merge PDFs",
    description: "Step-by-step: select multiple PDFs and merge them into a single file.",
    step: [
      {"@type": "HowToStep", name: "Select files", text: "Choose 2 or more PDF files from your computer."},
      {"@type": "HowToStep", name: "Upload", text: "Click Merge to upload and process the files."},
      {"@type": "HowToStep", name: "Download", text: "Download the combined PDF file."}
    ]
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Merge PDFs</h1>
          <p className="mt-4 text-lg text-gray-600">
            Combine multiple PDF files into a single document
          </p>
        </div>

        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold mb-3">Why use Modifly to merge PDFs?</h2>
            <p className="text-gray-600">Merging PDF documents is a common task for professionals and everyday users: combining multiple invoices, assembling contract packets, or consolidating project notes. Modifly provides a lightweight, privacy-focused tool that handles this without complex software. For small files the merge runs entirely in your browser—no upload required—so your documents stay private. For larger or encrypted files, Modifly uses secure server-side processing to ensure reliable results while still minimizing retention.</p>

            <h3 className="mt-6 text-lg font-semibold">Key benefits</h3>
            <p className="text-gray-600">Modifly is built for speed and convenience. You don’t need to install anything and there’s no account required. The merge flow preserves page order, page sizes, and document orientation. When bookmarks or outlines are present, Modifly preserves them where the source format permits. The UI is intentionally simple: choose files, click merge, download—Modifly handles the rest.</p>

            <h3 className="mt-6 text-lg font-semibold">How it works</h3>
            <p className="text-gray-600">Under the hood, the client first attempts to merge files using a reliable JavaScript PDF library to avoid network transfers. If the files are too large or contain advanced features (forms, embedded media), the app transparently falls back to a secure server-side processor that uses robust PDF tooling. Files are deleted from the server after processing and are never shared with third parties.</p>

            <h3 className="mt-6 text-lg font-semibold">Step-by-step</h3>
            <ol className="list-decimal list-inside text-gray-600 mt-3 space-y-2">
              <li>Select 2+ PDF files from your device. For best results, keep file sizes reasonable (under 50MB each) when using the client merge.</li>
              <li>Click “Merge PDFs” and wait for the progress indicator. Small jobs finish in a second; larger jobs may take a few moments.</li>
              <li>Download the resulting merged PDF. If you need a specific page order, rename files before uploading or reorder them in your file picker where supported.</li>
            </ol>

            <figure className="mt-6">
              <img src="/samples/merge-demo.svg" alt="Merge demo" className="w-full rounded border" />
              <figcaption className="text-xs text-gray-500 mt-2">Demo: combining two PDFs into one.</figcaption>
            </figure>
          </div>
        </section>

        <MergeTool />

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}