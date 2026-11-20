'use client'

import { Bookmark } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { Link } from '@/i18n/navigation'
import { useBookmarksStore } from '../../store/use-bookmarks-store'
import type { BlogPostCardItem, BookmarkedPostSummary } from '../../types'

interface BookmarkedWidgetProps {
  posts?: BlogPostCardItem[]
  isAuthenticated?: boolean
}

export function BookmarkedWidget({ posts = [], isAuthenticated = false }: BookmarkedWidgetProps) {
  const t = useTranslations('features.blog.reader')
  const isHydrated = useStoreHydration(useBookmarksStore)
  const guestBookmarks = useBookmarksStore((state) => state.guestBookmarks)
  const authOptimisticOverrides = useBookmarksStore((state) => state.authOptimisticOverrides)

  const displayedPosts = useMemo<BookmarkedPostSummary[]>(() => {
    if (isAuthenticated) {
      const baseIds = new Set(posts.map((p) => p.id))
      const newlyAdded: BookmarkedPostSummary[] = []

      for (const entry of Object.values(authOptimisticOverrides)) {
        if (entry.bookmarked && !baseIds.has(entry.post.id)) {
          newlyAdded.push(entry.post)
        }
      }

      const remainingBase = posts.filter((post) => {
        const override = authOptimisticOverrides[post.id]
        return override ? override.bookmarked : true
      })

      return [...newlyAdded, ...remainingBase]
    }

    if (!isHydrated) {
      return posts
    }

    return guestBookmarks
  }, [authOptimisticOverrides, guestBookmarks, isAuthenticated, isHydrated, posts])

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-primary fill-primary/20" />
          <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            {t('sidebar_bookmarked')}
          </h3>
        </div>
        {displayedPosts.length > 0 && (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold text-primary bg-primary/10 border border-primary/20">
            {displayedPosts.length}
          </span>
        )}
      </div>

      {displayedPosts.length > 0 ? (
        <div className="space-y-3">
          {displayedPosts.map((post) => (
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
