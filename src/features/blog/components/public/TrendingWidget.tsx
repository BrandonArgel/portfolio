import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { BlogPostCardItem } from '../../types'

interface TrendingWidgetProps {
  posts?: BlogPostCardItem[]
}

export async function TrendingWidget({ posts = [] }: TrendingWidgetProps) {
  const [t, format] = await Promise.all([getTranslations('blog'), getFormatter()])

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <TrendingUp className="size-4 text-primary" />
        <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          {t('sidebar_trending')}
        </h3>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const postDate =
              post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt)
            const formattedDate = format.dateTime(postDate, 'short')

            return (
              <div key={post.id} className="group space-y-1.5">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                >
                  {post.title}
                </Link>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>{formattedDate}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>
                      {post.readTimeMinutes} {t('read_time_suffix')}
                    </span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed">{t('empty_trending')}</p>
      )}
    </div>
  )
}
