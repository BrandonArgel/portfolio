import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * Next.js App Router Web App Manifest generator.
 *
 * ICON ASSET PLACEMENT GUIDE:
 * To complete the visual metadata setup, place the following static icon files directly
 * inside the `src/app/[locale]/` or `src/app/` directory:
 *
 * 1. `src/app/favicon.ico` -> Browser tab icon (32x32px standard format)
 * 2. `src/app/icon.svg` or `src/app/icon.png` -> High-res tab icon (512x512px)
 * 3. `src/app/apple-icon.png` -> Apple iOS Home Screen icon (180x180px)
 *
 * Next.js App Router automatically detects these convention files in `src/app/`
 * and serves the appropriate `<link rel="icon">` and `<link rel="apple-touch-icon">` tags.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#020617', // slate-950
    theme_color: '#1447e6', // primary brand blue
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
