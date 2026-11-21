import { ArrowLeft } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/button'
import type { BlogPost } from '../types'
import { ArticlePostHeader } from './article-post-header'
import { CategoryBadge } from './category-badge'
import { BookmarkPostButton } from './public/bookmark-post-button'
import { LikePostButton } from './public/like-post-button'
import { MdxContentServer } from './public/mdx-content-server'
import { SharePostMenu } from './public/share-post-menu'

interface BlogPostContentProps {
  post: BlogPost
  isBookmarked?: boolean
  initialLikesCount?: number
  initialIsLiked?: boolean
  isAuthenticated?: boolean
  action?: React.ReactNode
}

const ACTION_ICON_BUTTON_CLASS =
  'inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card p-0 [&_svg]:size-4'

export async function BlogPostContent({
  post,
  isBookmarked = false,
  initialLikesCount = 0,
  initialIsLiked = false,
  isAuthenticated = false,
  action,
}: BlogPostContentProps) {
  const [t, tBlog, format] = await Promise.all([
    getTranslations('features.blog.reader'),
    getTranslations('features.blog'),
    getFormatter(),
  ])

  const formattedDate = format.dateTime(post.createdAt, 'short')

  const postSummary = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
  }

  return (
    <article className="w-full">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <LinkButton
          href="/blog"
          variant="ghost"
          className="-ml-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('back_to_blog')}
        </LinkButton>

        <div className="flex flex-wrap items-center gap-2">
          <LikePostButton
            postId={post.id}
            slug={post.slug}
            initialLikesCount={initialLikesCount}
            initialIsLiked={initialIsLiked}
            isAuthenticated={isAuthenticated}
            location="post_page"
          />
          <SharePostMenu
            post={postSummary}
            location="post_page"
            variant="icon"
            className={ACTION_ICON_BUTTON_CLASS}
          />
          <BookmarkPostButton
            post={postSummary}
            initialBookmarked={isBookmarked}
            isAuthenticated={isAuthenticated}
            location="post_page"
            variant="icon"
            className={ACTION_ICON_BUTTON_CLASS}
          />
          {action}
        </div>
      </div>

      <ArticlePostHeader
        title={post.title}
        categories={post.categories}
        authorName={post.authorName}
        authorImage={post.authorImage}
        authorEmailVerified={post.authorEmailVerified}
        authorSubtitle={tBlog('author_subtitle')}
        verifiedAuthorLabel={tBlog('verified_author')}
        formattedDate={formattedDate}
        dateTimeIso={post.createdAt.toISOString()}
        readTimeMinutes={post.readTimeMinutes}
        readTimeSuffix={t('read_time_suffix')}
        viewsCount={post.viewsCount}
        viewsCountLabel={t('views_count', {
          count: post.viewsCount,
          formattedCount: format.number(post.viewsCount),
        })}
        coverImage={post.coverImage}
        coverImageAlt={post.coverImageAlt}
        priorityCover
      />

      <MdxContentServer content={post.content} />

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap gap-2">
          {post.categories?.map((category) => (
            <CategoryBadge
              key={category.id}
              category={category}
              variant="outline"
              className="text-xs"
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LikePostButton
            postId={post.id}
            slug={post.slug}
            initialLikesCount={initialLikesCount}
            initialIsLiked={initialIsLiked}
            isAuthenticated={isAuthenticated}
            location="post_page"
          />
          <SharePostMenu
            post={postSummary}
            location="post_page"
            variant="icon"
            className={ACTION_ICON_BUTTON_CLASS}
          />
          <BookmarkPostButton
            post={postSummary}
            initialBookmarked={isBookmarked}
            isAuthenticated={isAuthenticated}
            location="post_page"
            variant="icon"
            className={ACTION_ICON_BUTTON_CLASS}
          />
        </div>
      </footer>
    </article>
  )
}
