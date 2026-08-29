import './src/data/serverEnv'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
