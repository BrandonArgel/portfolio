import type { Metadata } from 'next'
import { getBaseUrl, siteConfig } from '@/config/site'
import { LOCALES, type Locale, routing } from '@/i18n/routing'
import { constructPageMetadata } from '@/lib/seo'

/** Recommended size of the social preview card (Open Graph / X / WhatsApp / LinkedIn). */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export const SEO_DESCRIPTION_MAX_LENGTH = 155

/** Formats that social crawlers do not render reliably as link-preview images. */
const UNSUPPORTED_OG_IMAGE_EXTENSIONS = /\.(svg|gif|avif|heic|heif)(?:$|[?#])/i

// ── Text helpers ────────────────────────────────────────────────

/**
 * Strips Markdown / MDX syntax and returns plain text suitable for meta descriptions.
 * Removes frontmatter, code blocks, ESM imports/exports, JSX/HTML tags, math blocks,
 * headings, list/quote markers, links, images and emphasis.
 */
export function stripMarkdown(content: string): string {
  return content
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Truncates at a word boundary and appends an ellipsis when needed. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const sliced = text.slice(0, maxLength - 1)
  const lastSpace = sliced.lastIndexOf(' ')
  const base = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced

  return `${base.replace(/[\s.,;:!?-]+$/, '')}…`
}

/**
 * Picks the post's own description, falling back to a clean excerpt of the content.
 * Always plain text and capped to the length search engines display.
 */
export function buildSeoDescription(
  description: string | null | undefined,
  content: string,
  maxLength: number = SEO_DESCRIPTION_MAX_LENGTH,
): string {
  const explicit = description ? stripMarkdown(description) : ''
  const base = explicit || stripMarkdown(content)

  return truncateText(base, maxLength) || siteConfig.description
}

// ── URL helpers ─────────────────────────────────────────────────

/** Resolves a relative or absolute URL against the site base URL. */
export function toAbsoluteUrl(url: string, baseUrl: string = getBaseUrl()): string {
  try {
    return new URL(url, `${baseUrl}/`).toString()
  } catch {
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }
}

function buildPostPath(locale: string, slug: string): string {
  return `/${locale}/blog/${slug}`
}

export function buildPostUrl(locale: string, slug: string, baseUrl: string = getBaseUrl()): string {
  return `${baseUrl}${buildPostPath(locale, slug)}`
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export interface PostOgImageInput {
  title: string
  slug: string
  locale: string
  coverImage?: string | null
  coverImageAlt?: string | null
  updatedAt: Date
}

export interface ResolvedOgImage {
  url: string
  width: number
  height: number
  alt: string
}

/**
 * Uses the post's cover image when it is a social-friendly raster format, otherwise points to
 * the dynamic `/api/og` card. The `v` param busts social-crawler caches after each edit.
 */
export function resolvePostOgImage(
  post: PostOgImageInput,
  baseUrl: string = getBaseUrl(),
): ResolvedOgImage {
  const alt = post.coverImageAlt?.trim() || post.title
  const trimmedCover = post.coverImage?.trim()

  if (trimmedCover && !UNSUPPORTED_OG_IMAGE_EXTENSIONS.test(trimmedCover)) {
    const resolvedCover = toAbsoluteUrl(trimmedCover, baseUrl)
    if (isHttpUrl(resolvedCover)) {
      return {
        url: resolvedCover,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt,
      }
    }
  }

  const params = new URLSearchParams({
    slug: post.slug,
    locale: post.locale,
    v: String(post.updatedAt.getTime()),
  })

  return {
    url: `${baseUrl}/api/og?${params.toString()}`,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
  }
}

export interface BlogPostMetadataInput {
  title: string
  slug: string
  locale: string
  requestedLocale?: string
  description?: string | null
  content: string
  coverImage?: string | null
  coverImageAlt?: string | null
  canonicalUrl?: string | null
  authorName?: string | null
  translationGroupId?: string | null
  categories: readonly { name: string }[]
  createdAt: Date
  updatedAt: Date
}

export function buildBlogPostMetadata(
  post: BlogPostMetadataInput,
  siblings: readonly PostTranslationRef[] = [],
  baseUrl: string = getBaseUrl(),
): Metadata {
  const categoryNames = post.categories.map((category) => category.name)
  const authorName = post.authorName || siteConfig.author.name
  const description = buildSeoDescription(post.description, post.content)
  const ogImage = resolvePostOgImage(post, baseUrl)
  const trimmedCanonical = post.canonicalUrl?.trim()
  const customCanonicalUrl =
    trimmedCanonical && isHttpUrl(trimmedCanonical) ? trimmedCanonical : undefined
  const nativePostUrl = buildPostUrl(post.locale, post.slug, baseUrl)
  const resolvedCanonical = customCanonicalUrl ?? nativePostUrl
  const isLocaleFallback = Boolean(post.requestedLocale && post.requestedLocale !== post.locale)

  // The canonical URL points to the post's custom canonical URL (when set) or its native locale URL
  // so an article served under a fallback locale is never indexed as duplicate content.
  const baseMetadata = constructPageMetadata({
    locale: post.locale,
    title: post.title,
    description,
    pathname: `/blog/${post.slug}`,
    baseUrl,
    languages: buildPostLanguageAlternates(
      { locale: post.locale, slug: post.slug },
      siblings,
      baseUrl,
    ),
    image: ogImage.url,
    imageAlt: ogImage.alt,
    imageWidth: ogImage.width,
    imageHeight: ogImage.height,
    keywords: categoryNames,
    type: 'article',
    publishedTime: post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    authors: [authorName],
    tags: categoryNames,
  })

  return {
    ...baseMetadata,
    alternates: {
      ...baseMetadata.alternates,
      canonical: resolvedCanonical,
    },
    ...(isLocaleFallback && {
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      },
    }),
  }
}

// ── Translations / hreflang ─────────────────────────────────────

export interface PostTranslationRef {
  locale: string
  slug: string
}

function isSupportedLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale)
}

/**
 * Builds `hreflang` alternates containing ONLY locales where a published translation exists
 * (never pointing to a locale that would render a fallback banner), plus `x-default`.
 */
export function buildPostLanguageAlternates(
  current: PostTranslationRef,
  translations: readonly PostTranslationRef[] = [],
  baseUrl: string = getBaseUrl(),
): Record<string, string> {
  const slugByLocale = new Map<string, string>()

  for (const item of translations) {
    if (isSupportedLocale(item.locale)) slugByLocale.set(item.locale, item.slug)
  }
  slugByLocale.set(current.locale, current.slug)

  const languages: Record<string, string> = {}

  for (const locale of routing.locales) {
    const slug = slugByLocale.get(locale)
    if (slug) languages[locale] = buildPostUrl(locale, slug, baseUrl)
  }

  const defaultSlug = slugByLocale.get(routing.defaultLocale)
  languages['x-default'] = defaultSlug
    ? buildPostUrl(routing.defaultLocale, defaultSlug, baseUrl)
    : buildPostUrl(current.locale, current.slug, baseUrl)

  return languages
}

// ── JSON-LD ─────────────────────────────────────────────────────

export interface BlogPostingJsonLdInput {
  title: string
  description: string
  slug: string
  locale: string
  authorName: string
  authorImage?: string | null
  canonicalUrl?: string | null
  categoryNames: readonly string[]
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  wordCount?: number
}

export function buildBlogPostingJsonLd(
  input: BlogPostingJsonLdInput,
  baseUrl: string = getBaseUrl(),
): Record<string, unknown> {
  const trimmedCanonical = input.canonicalUrl?.trim()
  const postUrl =
    trimmedCanonical && isHttpUrl(trimmedCanonical)
      ? trimmedCanonical
      : buildPostUrl(input.locale, input.slug, baseUrl)
  const trimmedAuthorImage = input.authorImage?.trim()
  const authorImageUrl = trimmedAuthorImage ? toAbsoluteUrl(trimmedAuthorImage, baseUrl) : undefined
  const authorSameAs = [
    siteConfig.links.github,
    siteConfig.links.linkedin,
    siteConfig.links.youtube,
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: truncateText(input.title, 110),
    description: input.description,
    image: [input.imageUrl],
    datePublished: input.createdAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    inLanguage: input.locale,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    author: {
      '@type': 'Person',
      name: input.authorName,
      url: siteConfig.author.url,
      ...(authorImageUrl ? { image: authorImageUrl } : {}),
      sameAs: authorSameAs,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    isAccessibleForFree: true,
    ...(input.categoryNames.length > 0 && {
      keywords: input.categoryNames.join(', '),
      articleSection: input.categoryNames[0],
    }),
    ...(input.wordCount !== undefined && { wordCount: input.wordCount }),
  }
}
