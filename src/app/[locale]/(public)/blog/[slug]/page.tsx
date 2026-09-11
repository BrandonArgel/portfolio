import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { getBaseUrl, siteConfig } from '@/config/site'
import { BlogPostContent } from '@/features/blog/components/blog-post-content'
import { EditPostButton } from '@/features/blog/components/public/EditPostButton'
import { TranslationFallbackBanner } from '@/features/blog/components/public/TranslationFallbackBanner'
import {
  getPostTranslationFallback,
  getPostTranslationsByGroupId,
  getPublishedPostBySlug,
} from '@/features/blog/services/posts.service'
import { redirect } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { constructPageMetadata } from '@/lib/seo'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'features.blog.reader' })

  const [err, post] = await getPublishedPostBySlug(slug)

  if (err || !post) {
    return {
      title: `${t('post_not_found')} | ${siteConfig.name}`,
      robots: { index: false, follow: false },
    }
  }

  // If the post belongs to a translation group, discover all localized sibling slugs
  let customSlugs: Partial<Record<Locale, string>> | undefined

  if (post.translationGroupId) {
    const siblings = await getPostTranslationsByGroupId(post.translationGroupId)
    if (siblings.length > 0) {
      customSlugs = {}
      for (const item of siblings) {
        customSlugs[item.locale as Locale] = `blog/${item.slug}`
      }
    }
  }

  const tags = post.categories.map((category) => category.name)
  const authorName = post.authorName || siteConfig.author.name
  const pathname = `/blog/${post.slug}`

  return constructPageMetadata({
    locale,
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
    pathname,
    keywords: tags,
    type: 'article',
    publishedTime: post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    authors: [authorName],
    tags,
    customSlugs,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params
  const activeLocale = locale as Locale
  const t = await getTranslations('features.blog.reader')

  const [err, post] = await getPublishedPostBySlug(slug)
  console.log({ post })

  if (err || !post) {
    if (err && err.reason !== 'NOT_FOUND') {
      return (
        <Section withGlow containerClassName="max-w-4xl py-20 text-center">
          <h1 className="text-2xl font-bold text-destructive">{t('error_loading_article')}</h1>
          <p className="mt-2 text-muted-foreground">{t('error_loading_article_description')}</p>
        </Section>
      )
    }

    return notFound()
  }

  let showFallbackBanner = false

  if (post.locale !== activeLocale) {
    if (post.translationGroupId) {
      const translatedSlug = await getPostTranslationFallback(post.translationGroupId, activeLocale)

      if (translatedSlug) {
        redirect({ href: `/blog/${translatedSlug}`, locale: activeLocale })
      }
    }

    showFallbackBanner = true
  }

  const baseUrl = getBaseUrl()
  const postUrl = `${baseUrl}/${post.locale}/blog/${post.slug}`
  const authorName = post.authorName || siteConfig.author.name

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: post.locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    author: {
      '@type': 'Person',
      name: authorName,
      url: siteConfig.author.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    keywords: post.categories.map((category) => category.name).join(', '),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Section withGlow containerClassName="max-w-4xl">
        {showFallbackBanner && (
          <div className="mb-6">
            <TranslationFallbackBanner originalLocale={post.locale} />
          </div>
        )}
        <BlogPostContent
          post={post}
          action={<EditPostButton authorId={post.authorId} slug={post.slug} />}
        />
      </Section>
    </>
  )
}
