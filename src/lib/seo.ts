import type { Metadata } from 'next'
import { getBaseUrl, siteConfig } from '@/config/site'
import { type Locale, routing } from '@/i18n/routing'

export function getAlternateLanguages(
  pathname = '',
  customSlugs?: Partial<Record<Locale, string>>,
): Record<string, string> {
  const baseUrl = getBaseUrl()
  const defaultLocale = routing.defaultLocale
  const cleanPath = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : ''
  const languages: Record<string, string> = {}

  for (const locale of routing.locales) {
    if (customSlugs?.[locale]) {
      const slugPath = customSlugs[locale]?.startsWith('/')
        ? customSlugs[locale]
        : `/${customSlugs[locale]}`
      languages[locale] = `${baseUrl}/${locale}${slugPath}`
    } else {
      languages[locale] = `${baseUrl}/${locale}${cleanPath}`
    }
  }

  const defaultSlugPath = customSlugs?.[defaultLocale]
    ? customSlugs[defaultLocale]?.startsWith('/')
      ? customSlugs[defaultLocale]
      : `/${customSlugs[defaultLocale]}`
    : cleanPath

  languages['x-default'] = `${baseUrl}/${defaultLocale}${defaultSlugPath}`

  return languages
}

export interface PageMetadataParams {
  locale: string
  title: string
  description: string
  pathname?: string
  image?: string
  keywords?: string[]
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  noIndex?: boolean
  customSlugs?: Partial<Record<Locale, string>>
}

/**
 * Standardized helper to construct complete, production-ready Next.js Metadata objects.
 */
export function constructPageMetadata({
  locale,
  title,
  description,
  pathname = '',
  image,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  tags,
  noIndex = false,
  customSlugs,
}: PageMetadataParams): Metadata {
  const baseUrl = getBaseUrl()
  const cleanPath = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : ''
  const currentUrl = `${baseUrl}/${locale}${cleanPath}`
  const ogImage = image || siteConfig.ogImage
  const languages = getAlternateLanguages(cleanPath, customSlugs)

  const authorList =
    authors && authors.length > 0
      ? authors.map((name) => ({ name, url: siteConfig.url }))
      : [{ name: siteConfig.author.name, url: siteConfig.url }]

  const metadata: Metadata = {
    title,
    description,
    keywords,
    authors: authorList,
    creator: siteConfig.author.name,
    publisher: siteConfig.name,
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    alternates: {
      canonical: currentUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: siteConfig.name,
      locale,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: authors || [siteConfig.author.name],
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: siteConfig.author.handle,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  }

  return metadata
}
