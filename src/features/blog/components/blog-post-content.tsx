import { ArrowLeft, BadgeCheck, Calendar, Clock, Eye } from 'lucide-react'
import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { getInitials } from '@/utils/get-initials'
import { PUBLIC_VIEWS_THRESHOLD } from '../constants/blog'
import type { BlogPost } from '../types'
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
  const displayAuthorName = post.authorName || siteConfig.author.name
  const showPublicViews = post.viewsCount >= PUBLIC_VIEWS_THRESHOLD

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

      <header className="mb-10 flex flex-col items-start gap-6 border-b border-border pb-10">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Badge key={category.id}>{category.name}</Badge>
            ))}
          </div>
        )}

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>

        <div className="w-full rounded-xl border border-border/70 bg-card/50 px-4 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Avatar size="lg">
                {post.authorImage && <AvatarImage src={post.authorImage} alt={displayAuthorName} />}
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(displayAuthorName)}
                </AvatarFallback>
              </Avatar>
              <BadgeCheck className="absolute bottom-0 -right-0.5 size-4 rounded-full border border-background bg-background fill-primary/25 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayAuthorName}</p>
              <p className="truncate text-xs text-muted-foreground">{tBlog('author_subtitle')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground shrink-0">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <time dateTime={post.createdAt.toISOString()}>{formattedDate}</time>
            </div>
            {post.readTimeMinutes > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
                <span>
                  {post.readTimeMinutes} {t('read_time_suffix')}
                </span>
              </div>
            )}
            {showPublicViews && (
              <div className="flex items-center gap-1.5 tabular-nums">
                <Eye className="size-4" />
                <span>
                  {t('views_count', {
                    count: post.viewsCount,
                    formattedCount: format.number(post.viewsCount),
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {post.coverImage && (
          <div className="mt-2 w-full overflow-hidden rounded-2xl border border-border shadow-md">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={630}
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="h-auto w-full"
            />
          </div>
        )}
      </header>

      <MdxContentServer content={post.content} />

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap gap-2">
          {post.categories?.map((category) => (
            <Badge key={category.id} variant="outline" className="text-xs">
              {category.name}
            </Badge>
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
