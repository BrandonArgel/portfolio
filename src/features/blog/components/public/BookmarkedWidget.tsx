import { Bookmark } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { BlogPostCardItem } from '../../types'

interface BookmarkedWidgetProps {
  posts?: BlogPostCardItem[]
}

export async function BookmarkedWidget({ posts = [] }: BookmarkedWidgetProps) {
  const t = await getTranslations('blog')

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <Bookmark className="size-4 text-primary fill-primary/20" />
        <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          {t('sidebar_bookmarked')}
        </h3>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block group text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-2 leading-snug font-medium"
            >
              {post.title}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed">{t('empty_bookmarked')}</p>
      )}
    </div>
  )
}
