import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { siteConfig } from '@/config/site'
import { BlogPostContent } from '@/features/blog/components/blog-post-content'
import { PostCommentsSection } from '@/features/blog/components/comments'
import { EditPostButton } from '@/features/blog/components/public/edit-post-button'
import { PostViewTracker } from '@/features/blog/components/public/post-view-tracker'
import { TranslationFallbackBanner } from '@/features/blog/components/public/translation-fallback-banner'
import { isPostBookmarkedByUser } from '@/features/blog/services/bookmarks-service'
import { getPostLikeStatus } from '@/features/blog/services/likes-service'
import {
  getPostTranslationFallback,
  getPostTranslationsByGroupId,
  getPublishedPostBySlug,
} from '@/features/blog/services/posts-service'
import {
  buildBlogPostingJsonLd,
  buildBlogPostMetadata,
  buildSeoDescription,
  resolvePostOgImage,
  stripMarkdown,
} from '@/features/blog/utils/post-seo'
import { redirect } from '@/i18n/navigation'
import { type Locale, routing } from '@/i18n/routing'
import { getOptionalSession } from '@/lib/auth/get-optional-session'
import { assertNever } from '@/utils/result'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  const t = await getTranslations({ locale: safeLocale, namespace: 'features.blog.reader' })

  const [err, post] = await getPublishedPostBySlug(slug, safeLocale)

  if (err || !post) {
    return {
      title: t('post_not_found'),
      robots: { index: false, follow: false },
    }
  }

  const siblings = post.translationGroupId
    ? await getPostTranslationsByGroupId(post.translationGroupId)
    : []

  return buildBlogPostMetadata({ ...post, requestedLocale: safeLocale }, siblings)
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params
  const activeLocale = locale as Locale
  const t = await getTranslations('features.blog.reader')

  const [[err, post], session] = await Promise.all([
    getPublishedPostBySlug(slug, locale),
    getOptionalSession(),
  ])

  if (err) {
    switch (err.reason) {
      case 'POST_NOT_FOUND':
        return notFound()
      case 'DATABASE_ERROR':
        return (
          <Section withGlow containerClassName="max-w-4xl py-20 text-center">
            <h1 className="text-2xl font-bold text-destructive">{t('error_loading_article')}</h1>
            <p className="mt-2 text-muted-foreground">{t('error_loading_article_description')}</p>
          </Section>
        )
      default:
        return assertNever(err)
    }
  }

  if (!post) {
    return notFound()
  }

  const userId = session?.user?.id
  const isAuthenticated = Boolean(userId)
  const [isBookmarked, likeStatus] = await Promise.all([
    userId ? isPostBookmarkedByUser(userId, post.id) : Promise.resolve(false),
    getPostLikeStatus(post.id, userId),
  ])

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
    authorImage: post.authorImage,
    canonicalUrl: post.canonicalUrl,
    categoryNames: post.categories.map((category) => category.name),
    imageUrl: resolvePostOgImage(post).url,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    wordCount: stripMarkdown(post.content).split(' ').filter(Boolean).length,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <PostViewTracker postId={post.id} />
      <Section withGlow containerClassName="max-w-4xl">
        {showFallbackBanner && (
          <div className="mb-6">
            <TranslationFallbackBanner originalLocale={post.locale} />
          </div>
        )}
        <BlogPostContent
          post={post}
          isBookmarked={isBookmarked}
          initialLikesCount={likeStatus.likesCount}
          initialIsLiked={likeStatus.isLiked}
          isAuthenticated={isAuthenticated}
          action={<EditPostButton authorId={post.authorId} slug={post.slug} />}
        />
        <PostCommentsSection postId={post.id} postAuthorId={post.authorId} postSlug={post.slug} />
      </Section>
    </>
  )
}
