'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useOptimistic, useTransition } from 'react'
import { sileo } from 'sileo'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { type BlogInteractionLocation, track } from '@/lib/analytics/events'
import { togglePostBookmarkAction } from '../actions/bookmark-actions'
import { bookmarksStoreActions, useBookmarksStore } from '../store/use-bookmarks-store'
import type { BookmarkedPostSummary } from '../types'
import { useBlogErrors } from './use-blog-errors'

export interface UsePostBookmarkOptions {
  post: BookmarkedPostSummary
  initialBookmarked?: boolean
  isAuthenticated?: boolean
  location: BlogInteractionLocation
}

export function usePostBookmark({
  post,
  initialBookmarked = false,
  isAuthenticated = false,
  location,
}: UsePostBookmarkOptions) {
  const t = useTranslations('features.blog.reader')
  const { handleBlogError } = useBlogErrors()
  const isHydrated = useStoreHydration(useBookmarksStore)
  const [isPending, startTransition] = useTransition()

  const isGuestBookmarked = useBookmarksStore((state) =>
    state.guestBookmarks.some((item) => item.id === post.id),
  )
  const authOverride = useBookmarksStore(
    (state) => state.authOptimisticOverrides[post.id]?.bookmarked,
  )

  const baseBookmarked = isAuthenticated
    ? (authOverride ?? initialBookmarked)
    : isHydrated
      ? isGuestBookmarked
      : false

  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    baseBookmarked,
    (_currentState: boolean, nextValue: boolean) => nextValue,
  )

  const toggleBookmark = useCallback(() => {
    const nextBookmarked = !optimisticBookmarked

    track('Blog_Post_Bookmarked', {
      postId: post.id,
      slug: post.slug,
      action: nextBookmarked ? 'added' : 'removed',
      authenticated: isAuthenticated,
      location,
    })

    if (!isAuthenticated) {
      const added = bookmarksStoreActions.toggleGuestBookmark(post)
      sileo.success({
        title: added ? t('actions.bookmarked') : t('actions.bookmark_removed'),
        description: post.title,
      })
      return
    }

    bookmarksStoreActions.setAuthOptimisticOverride(post, nextBookmarked)

    startTransition(async () => {
      setOptimisticBookmarked(nextBookmarked)

      const [err, result] = await togglePostBookmarkAction(post.id)

      if (err) {
        bookmarksStoreActions.clearAuthOptimisticOverride(post.id)
        handleBlogError(err)
        return
      }

      bookmarksStoreActions.setAuthOptimisticOverride(post, result.bookmarked)
      sileo.success({
        title: result.bookmarked ? t('actions.bookmarked') : t('actions.bookmark_removed'),
        description: post.title,
      })
    })
  }, [
    handleBlogError,
    isAuthenticated,
    location,
    optimisticBookmarked,
    post,
    setOptimisticBookmarked,
    t,
  ])

  return {
    isBookmarked: optimisticBookmarked,
    isPending,
    toggleBookmark,
  }
}
