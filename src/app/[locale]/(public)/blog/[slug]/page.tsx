import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { getBaseUrl, siteConfig } from '@/config/site'
import { BlogPostContent } from '@/features/blog/components/blog-post-content'
import type { Locale } from '@/i18n/routing'
import { constructPageMetadata } from '@/lib/seo'
import { getPostTranslationsByGroupId, getPublishedPostBySlug } from '@/services/posts.service'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

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

  const tags = post.tags.map((tag) => tag.name)
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
  const { slug } = await params
  const t = await getTranslations('blog')

  const [err, post] = await getPublishedPostBySlug(slug)

  if (err) {
    if (err.reason === 'NOT_FOUND') {
      return notFound()
    }

    return (
      <Section withGlow containerClassName="max-w-4xl py-20 text-center">
        <h1 className="text-2xl font-bold text-destructive">{t('error_loading_article')}</h1>
        <p className="mt-2 text-muted-foreground">{t('error_loading_article_description')}</p>
      </Section>
    )
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
    keywords: post.tags.map((tag) => tag.name).join(', '),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Section withGlow containerClassName="max-w-4xl">
        <BlogPostContent post={post} />
      </Section>
    </>
  )
}
