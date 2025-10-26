/** @type {import('next').NextConfig} */
const nextConfig = {
	// Produce a standalone output which copies only necessary runtime files
	// into `.next/standalone` for a smaller production image.
	output: 'standalone',
}

module.exports = nextConfig