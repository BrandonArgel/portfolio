import { Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { BlogPostCardItem } from '../../types'
import { ArticleCardActions } from './ArticleCardActions'

interface ArticleCardProps {
  post: BlogPostCardItem
}

export async function ArticleCard({ post }: ArticleCardProps) {
  const [t, format] = await Promise.all([getTranslations('features.blog.reader'), getFormatter()])

  const postDate = post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt)
  const formattedDate = format.dateTime(postDate, 'short')

  const primaryBadge = post.categories[0]?.name || post.coverBadge || 'Engineering'

  return (
    <article className="group flex flex-col h-full bg-card text-card-foreground hover:bg-card/90 border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Visual Cover Banner */}
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
        <div className="relative h-44 w-full overflow-hidden bg-muted/40 border-b border-border flex flex-col items-center justify-center p-4 text-center select-none group-hover:scale-[1.01] transition-transform duration-300">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[16px_16px] opacity-40" />

              {/* Centered card mockup badge */}
              <div className="relative z-10 px-3 py-1.5 rounded-md bg-card text-card-foreground shadow-sm font-bold text-xs max-w-[90%] truncate border border-border">
                {primaryBadge}
              </div>
              <span className="relative z-10 text-xs text-muted-foreground font-mono mt-1.5 tracking-wider uppercase">
                {post.domainWatermark || 'brandonargel.com'}
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.categories.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <Link href={`/blog/${post.slug}`} className="block">
            <h3 className="font-bold text-foreground text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4 leading-relaxed mt-2.5">
            {post.excerpt}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              <span>{formattedDate}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>
                {post.readTimeMinutes} {t('read_time_suffix')}
              </span>
            </span>
          </div>

          <ArticleCardActions slug={post.slug} title={post.title} />
        </div>
      </div>
    </article>
  )
}
