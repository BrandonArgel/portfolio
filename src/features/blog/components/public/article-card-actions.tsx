'use client'

import type { BlogInteractionLocation } from '@/lib/analytics/events'
import { BookmarkPostButton } from './bookmark-post-button'
import { SharePostMenu } from './share-post-menu'

interface ArticleCardActionsProps {
  post: {
    id: string
    title: string
    slug: string
    description?: string
  }
  initialBookmarked?: boolean
  isAuthenticated?: boolean
  location?: BlogInteractionLocation
  variant?: 'icon' | 'button'
}

export function ArticleCardActions({
  post,
  initialBookmarked = false,
  isAuthenticated = false,
  location = 'card',
  variant = 'icon',
}: ArticleCardActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <SharePostMenu post={post} location={location} variant={variant} />
      <BookmarkPostButton
        post={post}
        initialBookmarked={initialBookmarked}
        isAuthenticated={isAuthenticated}
        location={location}
        variant={variant}
      />
    </div>
  )
}
