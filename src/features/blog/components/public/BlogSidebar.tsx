import type { BlogCategory, BlogPostCardItem } from '../../types'
import { BookmarkedWidget } from './BookmarkedWidget'
import { CategoryFilter } from './CategoryFilter'
import { TrendingWidget } from './TrendingWidget'

interface BlogSidebarProps {
  categories: BlogCategory[]
  totalCount?: number
  categoryCounts?: Record<string, number>
  bookmarkedPosts?: BlogPostCardItem[]
  trendingPosts?: BlogPostCardItem[]
  isAuthenticated?: boolean
}

export function BlogSidebar({
  categories,
  totalCount = 0,
  categoryCounts = {},
  bookmarkedPosts = [],
  trendingPosts = [],
  isAuthenticated = false,
}: BlogSidebarProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-24">
      <CategoryFilter
        categories={categories}
        totalCount={totalCount}
        categoryCounts={categoryCounts}
      />
      <BookmarkedWidget posts={bookmarkedPosts} isAuthenticated={isAuthenticated} />
      <TrendingWidget posts={trendingPosts} />
    </aside>
  )
}
