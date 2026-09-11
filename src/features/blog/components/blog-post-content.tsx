// src/features/blog/components/blog-post-content.tsx
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import type { BlogPost } from '../types'
import { MdxContentServer } from './public/MdxContentServer'

interface BlogPostContentProps {
  post: BlogPost
  action?: React.ReactNode
}

export async function BlogPostContent({ post, action }: BlogPostContentProps) {
  const [t, format] = await Promise.all([getTranslations('features.blog.reader'), getFormatter()])

  const formattedDate = format.dateTime(post.createdAt, 'short')

  return (
    <article className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <LinkButton
          href="/blog"
          variant="ghost"
          className="-ml-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('back_to_blog')}
        </LinkButton>

        {action}
      </div>

      <header className="mb-10 flex flex-col items-start gap-6 border-b border-border pb-10">
        {/* ✨ CAMBIO: Ahora iteramos sobre categories en lugar de tags */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {post.authorName && (
            <div className="flex items-center gap-2">
              <User className="size-4" />
              <span>{post.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <time dateTime={post.createdAt.toISOString()}>{formattedDate}</time>
          </div>
          {post.readTimeMinutes && (
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>
                {post.readTimeMinutes} {t('read_time_suffix')}
              </span>
            </div>
          )}
        </div>

        {post.coverImage && (
          <div className="relative aspect-video sm:aspect-21/9 w-full overflow-hidden rounded-2xl border border-border shadow-md mt-2">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        )}
      </header>
      <MdxContentServer content={post.content} />
    </article>
  )
}
