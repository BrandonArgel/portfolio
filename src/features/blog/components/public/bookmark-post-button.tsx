'use client'

import { Bookmark } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { BlogInteractionLocation } from '@/lib/analytics/events'
import { cn } from '@/lib/utils'
import { usePostBookmark } from '../../hooks/use-post-bookmark'
import type { BookmarkedPostSummary } from '../../types'

export interface BookmarkPostButtonProps {
  post: BookmarkedPostSummary
  initialBookmarked?: boolean
  isAuthenticated?: boolean
  location: BlogInteractionLocation
  variant?: 'icon' | 'button'
  className?: string
}

export function BookmarkPostButton({
  post,
  initialBookmarked = false,
  isAuthenticated = false,
  location,
  variant = 'icon',
  className,
}: BookmarkPostButtonProps) {
  const t = useTranslations('features.blog.reader')
  const { isBookmarked, isPending, toggleBookmark } = usePostBookmark({
    post,
    initialBookmarked,
    isAuthenticated,
    location,
  })

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleBookmark()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        variant === 'button'
          ? 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-70'
          : 'p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-70',
        isBookmarked
          ? variant === 'button'
            ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
            : 'text-primary hover:text-primary/80'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        className,
      )}
      aria-label={t('actions.bookmark')}
      aria-pressed={isBookmarked}
      title={t('actions.bookmark')}
    >
      <Bookmark className={cn('size-3.5 transition-all', isBookmarked && 'fill-primary')} />
      {variant === 'button' && (
        <span>{isBookmarked ? t('actions.bookmarked_label') : t('actions.bookmark')}</span>
      )}
    </button>
  )
}
