import { FileQuestion, RotateCcw } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type * as React from 'react'
import { Link } from '@/i18n/navigation'
import type { BlogPostCardItem } from '../../types'
import { ArticleCard } from './ArticleCard'
import { SortTabs } from './SortTabs'

interface BlogFeedProps {
  posts: BlogPostCardItem[]
  totalCount?: number
  activeCategoryName?: string
  currentPage?: number
  limit?: number
  children?: React.ReactNode
}

export async function BlogFeed({
  posts,
  totalCount = 0,
  activeCategoryName,
  currentPage = 1,
  limit = 9,
  children,
}: BlogFeedProps) {
  const t = await getTranslations('blog')

  const title = activeCategoryName || t('all_articles')
  const count = posts.length
  const total = totalCount > 0 ? totalCount : count

  const start = count > 0 ? (currentPage - 1) * limit + 1 : 0
  const end = count > 0 ? Math.min((currentPage - 1) * limit + count, total) : 0
  const showingText = count > 0 ? t('showing_articles', { start, end, total }) : ''

  return (
    <div className="flex-1 min-w-0 space-y-6">
      {/* Top Header Row with Title and SortTabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight capitalize">
            {title}
          </h2>
          {showingText && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{showingText}</p>
          )}
        </div>

        <SortTabs />
      </div>

      {/* Articles Grid */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {children}
        </div>
      ) : (
        <div className="py-20 text-center bg-card border border-border rounded-2xl p-8 space-y-4">
          <FileQuestion className="size-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{t('no_results')}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-medium transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>{t('clear_filters')}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
