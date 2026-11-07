import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/config/site'
import { getAllPublishedPostsForSitemap } from '@/features/blog/services/posts-service'
import {
  buildPostLanguageAlternates,
  buildPostUrl,
  type PostTranslationRef,
} from '@/features/blog/utils/post-seo'
import { routing } from '@/i18n/routing'

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/resume', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms-of-service', priority: 0.3, changeFrequency: 'yearly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const defaultLocale = routing.defaultLocale
  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const route of STATIC_ROUTES) {
    const alternateLanguages: Record<string, string> = {}

    for (const loc of routing.locales) {
      alternateLanguages[loc] = `${baseUrl}/${loc}${route.path}`
    }
    alternateLanguages['x-default'] = `${baseUrl}/${defaultLocale}${route.path}`

    for (const locale of routing.locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: alternateLanguages,
        },
      })
    }
  }

  const publishedPosts = await getAllPublishedPostsForSitemap()

  const translationsByGroup = new Map<string, PostTranslationRef[]>()

  for (const post of publishedPosts) {
    if (!post.translationGroupId) continue

    const group = translationsByGroup.get(post.translationGroupId) ?? []
    group.push({ locale: post.locale, slug: post.slug })
    translationsByGroup.set(post.translationGroupId, group)
  }

  for (const post of publishedPosts) {
    const translations = post.translationGroupId
      ? (translationsByGroup.get(post.translationGroupId) ?? [])
      : []

    sitemapEntries.push({
      url: buildPostUrl(post.locale, post.slug, baseUrl),
      lastModified: post.updatedAt || post.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: buildPostLanguageAlternates(
          { locale: post.locale, slug: post.slug },
          translations,
          baseUrl,
        ),
      },
    })
  }

  return sitemapEntries
}
