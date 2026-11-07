import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { siteConfig } from '@/config/site'
import { BlogPostContent } from '@/features/blog/components/blog-post-content'
import { PostCommentsSection } from '@/features/blog/components/comments'
import { EditPostButton } from '@/features/blog/components/public/EditPostButton'
import { TranslationFallbackBanner } from '@/features/blog/components/public/TranslationFallbackBanner'
import { isPostBookmarkedByUser } from '@/features/blog/services/bookmarks-service'
import {
  getPostTranslationFallback,
  getPostTranslationsByGroupId,
  getPublishedPostBySlug,
} from '@/features/blog/services/posts-service'
import {
  buildBlogPostingJsonLd,
  buildPostLanguageAlternates,
  buildSeoDescription,
  resolvePostOgImage,
  stripMarkdown,
} from '@/features/blog/utils/post-seo'
import { redirect } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { auth } from '@/lib/auth/auth'
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

  const [err, post] = await getPublishedPostBySlug(slug, locale)

  if (err || !post) {
    return {
      title: t('post_not_found'),
      robots: { index: false, follow: false },
    }
  }

  const siblings = post.translationGroupId
    ? await getPostTranslationsByGroupId(post.translationGroupId)
    : []

  const categoryNames = post.categories.map((category) => category.name)
  const authorName = post.authorName || siteConfig.author.name
  const description = buildSeoDescription(post.description, post.content)
  const ogImage = resolvePostOgImage(post)

  // The canonical URL always points to the post's own locale so the same article served under
  // another locale (with the fallback banner) is not indexed as duplicate content.
  return constructPageMetadata({
    locale: post.locale,
    title: post.title,
    description,
    pathname: `/blog/${post.slug}`,
    languages: buildPostLanguageAlternates({ locale: post.locale, slug: post.slug }, siblings),
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
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params
  const activeLocale = locale as Locale
  const t = await getTranslations('features.blog.reader')

  const [[err, post], session] = await Promise.all([
    getPublishedPostBySlug(slug, locale),
    auth.api.getSession({ headers: await headers() }),
  ])

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

  const userId = session?.user?.id
  const isAuthenticated = Boolean(userId)
  const isBookmarked = userId ? await isPostBookmarkedByUser(userId, post.id) : false

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

  const authorName = post.authorName || siteConfig.author.name

  const jsonLd = buildBlogPostingJsonLd({
    title: post.title,
    description: buildSeoDescription(post.description, post.content),
    slug: post.slug,
    locale: post.locale,
    authorName,
    categoryNames: post.categories.map((category) => category.name),
    imageUrl: resolvePostOgImage(post).url,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    wordCount: stripMarkdown(post.content).split(' ').filter(Boolean).length,
  })

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
          isBookmarked={isBookmarked}
          isAuthenticated={isAuthenticated}
          action={<EditPostButton authorId={post.authorId} slug={post.slug} />}
        />
        <PostCommentsSection postId={post.id} postAuthorId={post.authorId} postSlug={post.slug} />
      </Section>
    </>
  )
}
