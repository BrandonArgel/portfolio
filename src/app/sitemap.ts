import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/config/site'
import { getAllPublishedPostsForSitemap } from '@/features/blog/services/posts.service'
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

  const translationGroupMap = new Map<string, Map<string, string>>()

  for (const post of publishedPosts) {
    if (post.translationGroupId) {
      if (!translationGroupMap.has(post.translationGroupId)) {
        translationGroupMap.set(post.translationGroupId, new Map())
      }
      translationGroupMap.get(post.translationGroupId)?.set(post.locale, post.slug)
    }
  }

  for (const post of publishedPosts) {
    const alternateLanguages: Record<string, string> = {}

    if (post.translationGroupId && translationGroupMap.has(post.translationGroupId)) {
      const groupLocales = translationGroupMap.get(post.translationGroupId)
      if (groupLocales) {
        for (const loc of routing.locales) {
          const slugToUse = groupLocales.get(loc) || post.slug
          alternateLanguages[loc] = `${baseUrl}/${loc}/blog/${slugToUse}`
        }

        const defaultSlug = groupLocales.get(defaultLocale) || post.slug
        alternateLanguages['x-default'] = `${baseUrl}/${defaultLocale}/blog/${defaultSlug}`
      }
    } else {
      for (const loc of routing.locales) {
        alternateLanguages[loc] = `${baseUrl}/${loc}/blog/${post.slug}`
      }
      alternateLanguages['x-default'] = `${baseUrl}/${defaultLocale}/blog/${post.slug}`
    }

    sitemapEntries.push({
      url: `${baseUrl}/${post.locale}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: alternateLanguages,
      },
    })
  }

  return sitemapEntries
}
