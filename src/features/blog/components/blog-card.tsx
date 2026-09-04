import { Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import { useFormatter, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { BlogPostCardItem } from '../types'
import { BlogThumbnail } from './blog-thumbnail'

interface BlogCardProps {
  post: BlogPostCardItem
  className?: string
}

export function BlogCard({ post, className }: BlogCardProps) {
  const t = useTranslations('blog')
  const format = useFormatter()

  const formattedDate = format.dateTime(new Date(post.publishedAt), 'short')

  return (
    <article
      className={cn(
        'group/blog-card relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/90 hover:shadow-2xl hover:-translate-y-1',
        className,
      )}
    >
      <div>
        {/* Cover Graphic Banner */}
        <Link
          href={`/blog/${post.slug}`}
          className="block focus:outline-none overflow-hidden rounded-xl"
        >
          {post.coverImage ? (
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-border/70 transition-transform duration-500 group-hover/blog-card:scale-[1.02]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ) : (
            <BlogThumbnail
              title={post.title}
              coverBadge={post.coverBadge}
              domainWatermark={post.domainWatermark}
            />
          )}
        </Link>

        {/* Tags Row */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 mb-3 flex flex-wrap gap-1.5 sm:gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 dark:bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover/blog-card:border-primary/30 group-hover/blog-card:text-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Post Title */}
        <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground transition-colors group-hover/blog-card:text-primary sm:text-xl">
          <Link
            href={`/blog/${post.slug}`}
            className="line-clamp-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        {/* Post Excerpt */}
        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      </div>

      {/* Metadata Footer */}
      <footer className="mt-auto flex items-center justify-between border-t border-border/40 pt-4 text-xs font-medium text-muted-foreground/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5 shrink-0" />
          <time dateTime={new Date(post.publishedAt).toISOString()}>{formattedDate}</time>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          <span>
            {post.readTimeMinutes} {t('read_time_suffix')}
          </span>
        </div>
      </footer>
    </article>
  )
}
