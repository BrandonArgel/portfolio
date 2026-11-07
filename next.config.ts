import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Must stay in sync with SERVER_BODY_SIZE_LIMIT in src/config/image-upload.ts
      // (4 MB max image + multipart overhead, under Vercel's ~4.5 MB request cap).
      bodySizeLimit: '4.5mb',
    },
  },
}

export default withNextIntl(nextConfig)
