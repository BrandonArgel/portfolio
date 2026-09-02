import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import type { BlogPost } from '@/types/blog'
import { MarkdownContent } from './markdown-content'

interface BlogPostContentProps {
  post: BlogPost
}

export async function BlogPostContent({ post }: BlogPostContentProps) {
  const t = await getTranslations('blog')
  const locale = await getLocale()

  const formattedDate = new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(post.createdAt)

  return (
    <article className="w-full">
      <LinkButton
        href="/blog"
        variant="ghost"
        className="mb-8 -ml-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t('back_to_blog')}
      </LinkButton>

      <header className="mb-10 flex flex-col items-start gap-6 border-b border-border pb-10">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
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
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>
              {post.readTimeMinutes} {t('read_time_suffix')}
            </span>
          </div>
        </div>
      </header>

      <MarkdownContent content={post.content} />
    </article>
  )
}
