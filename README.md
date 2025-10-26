# Modifly — PDF & Image Tools

This repository contains Modifly, a Next.js web application providing free PDF & image tools (merge, split, convert, compress, protect, unlock, rotate, watermark, organize). The app is optimized for privacy and can be monetized via Google AdSense and GA4.

## Quick local setup

Requirements:
- Node.js 18+ (this project used v22 during development)
- npm
- (optional) Python 3.10+ and PyMuPDF if you plan to use Python-backed conversions
- ImageMagick and LibreOffice for some server-side conversions

Install and run locally:

```powershell
cd 'C:\Users\Manojkumar\OneDrive\Desktop\Workflow\file converter'
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Create a `.env.local` file in the project root for local development with these values as needed:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.example
NEXT_PUBLIC_ADSENSE_CLIENT=pub-XXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT=NNNNNNNNNN
NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT=true
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_token_here
```

Notes:
- Do not commit secrets. Use GitHub Secrets or your hosting platform's environment variables for production.

## Monetization & Ads

1. Add `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` to enable `AdSlot` components.
2. `ConsentBanner` collects ad consent and stores it in `localStorage`. Set `NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT=true` to require consent before loading ads.
3. Place your AdSense publisher ID in `public/ads.txt` (replace `PUBID`).
4. To verify the site with Google, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` with the token Google provides and add the site to Google Search Console.

## Analytics

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable GA4; it will load only after consent is granted (if consent requirement is enabled).

## SEO & Content

- Landing pages for Merge, Split and Convert include JSON-LD (HowTo/FAQ) to improve rich results.
- Add long-form content and guides (500–1000 words) for each tool to increase organic rankings.
- Submit `https://yourdomain.example/sitemap.xml` to Google Search Console.

## CI / Deployment

This repo contains a GitHub Actions workflow `.github/workflows/ci.yml` that runs build and tests on push. For deployment, connect to Vercel (recommended) or Netlify. For Vercel, set `VERCEL_TOKEN` and use Vercel's Git integration or the Vercel CLI.

## Lighthouse & Core Web Vitals

Run Lighthouse against a deployed staging URL for accurate Core Web Vitals (CWV). Locally you can use Chrome DevTools Lighthouse or the lighthouse CLI.

## Support

If you need help configuring AdSense, GA4, or deployment, ask here and I will provide step-by-step instructions.
# Modifly - Advanced PDF Tools By Testcraft.in

An upgraded web application for PDF manipulation, inspired by ilovepdf.com but with modern features and improved user experience. Created by Testcraft.in.

## Features

- **Merge PDFs**: Combine multiple PDF files into a single document
- **Convert PDFs**: Transform PDFs to various formats (planned)
- **Split PDFs**: Divide PDFs into separate files (planned)
- **Compress PDFs**: Reduce file size while maintaining quality (planned)
- **Protect PDFs**: Add password protection (planned)
- **Unlock PDFs**: Remove password protection (planned)

## Upgraded Features

- Batch processing for multiple files
- Real-time preview before conversion
- Cloud storage integration (planned)
- Advanced compression options (planned)
- OCR text recognition (planned)

## Tech Stack

- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **PDF Processing**: pdf-lib library
- **Styling**: Tailwind CSS with responsive design

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/page.tsx`: Main application page with tool interface
- `app/api/`: API routes for PDF operations
- `app/layout.tsx`: Root layout component
- `app/globals.css`: Global styles

## API Endpoints

- `POST /api/merge`: Merge multiple PDFs
  - Accepts FormData with 'files' array
  - Returns merged PDF as download

## Development

- `npm run build`: Build for production
- `npm run lint`: Run ESLint

## Image/GIF server dependencies

Some advanced image and animated GIF operations rely on system image tools. The project will use `ImageMagick` (magick/convert) when available for GIF frame-aware operations. If you need animated GIF resize/convert/overlay support, install one of the following on your server:

- ImageMagick (recommended) — provides `magick` or `convert` CLI
- gifsicle — lightweight GIF-specific tool (optional)

Quick install examples:

Windows (Chocolatey):
```powershell
choco install imagemagick
choco install gifsicle
```

Ubuntu/Debian:
```bash
sudo apt update; sudo apt install imagemagick gifsicle -y
```

macOS (Homebrew):
```bash
brew install imagemagick gifsicle
```

If these binaries are not available, the GIF endpoints will return a helpful error instructing you how to install them.

New GIF endpoints added:

- `POST /api/images/gif/resize` — resize animated GIFs (requires ImageMagick)
- `POST /api/images/gif/overlay` — overlay an image across GIF frames (requires ImageMagick)
- `POST /api/images/gif/add-text` — render text over GIF frames (requires ImageMagick)

These endpoints will return 501 (Not Implemented) when ImageMagick is not found on the host. See `npm run check-deps` to detect missing system binaries.

## Contributing

This project follows standard Next.js development practices. API routes handle server-side processing, while client components manage UI interactions.

## Environment variables

Copy `.env.example` to `.env.local` in the project root to configure local environment variables used by Next.js. Example variables in `.env.example`:

- `NEXT_PUBLIC_SITE_URL` — the canonical site URL used for sitemap and JSON-LD (e.g., https://example.com)
- `NEXT_PUBLIC_GA_ID` — your GA4 Measurement ID (G-XXXX)
- `NEXT_PUBLIC_ADSENSE_CLIENT` — your AdSense client id (ca-pub-...)
- `ADMIN_USER` / `ADMIN_PASS` — credentials for the simple admin login API (change these before deploying)

PowerShell example to run the development server with env vars (temporary for the session):

```powershell
$env:NEXT_PUBLIC_SITE_URL='http://localhost:3000';
$env:NEXT_PUBLIC_GA_ID='G-XXXXXXXXXX';
$env:NEXT_PUBLIC_ADSENSE_CLIENT='ca-pub-XXXXXXXXXXXX';
$env:ADMIN_USER='admin';
$env:ADMIN_PASS='strong-password-here';
npm run dev
```

Or, create `.env.local` with the same values (Next.js will pick them up automatically).

Security note: Do not commit real secrets to source control. Use platform environment variable management or secrets for production deployments.