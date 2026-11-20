'use client'

import { useCallback, useOptimistic, useTransition } from 'react'
import { sileo } from 'sileo'
import { type BlogInteractionLocation, track } from '@/lib/analytics/events'
import { togglePostLikeAction } from '../actions/like-actions'
import { likesStoreActions, useLikesStore } from '../store/use-likes-store'
import { useLikeErrors } from './use-like-errors'

export interface UsePostLikeOptions {
  postId: string
  slug: string
  initialLikesCount: number
  initialIsLiked?: boolean
  isAuthenticated?: boolean
  location: BlogInteractionLocation
}

export function usePostLike({
  postId,
  slug,
  initialLikesCount,
  initialIsLiked = false,
  isAuthenticated = false,
  location,
}: UsePostLikeOptions) {
  const { handleLikeError, getLikeErrorMessage } = useLikeErrors()
  const [isPending, startTransition] = useTransition()

  const override = useLikesStore((state) => state.overrides[postId])
  const baseLiked = isAuthenticated ? (override?.isLiked ?? initialIsLiked) : false
  const baseCount = override?.likesCount ?? initialLikesCount

  const [optimisticState, setOptimisticState] = useOptimistic(
    { isLiked: baseLiked, likesCount: baseCount },
    (_current, next: { isLiked: boolean; likesCount: number }) => next,
  )

  const toggleLike = useCallback(() => {
    if (!isAuthenticated) {
      track('Blog_Post_Liked', {
        postId,
        slug,
        action: 'added',
        authenticated: false,
        location,
      })
      sileo.info(getLikeErrorMessage({ reason: 'UNAUTHORIZED' }))
      return
    }

    const prevSnapshot = { isLiked: baseLiked, likesCount: baseCount }
    const nextLiked = !optimisticState.isLiked
    const nextCount = Math.max(0, optimisticState.likesCount + (nextLiked ? 1 : -1))
    const nextSnapshot = { isLiked: nextLiked, likesCount: nextCount }

    track('Blog_Post_Liked', {
      postId,
      slug,
      action: nextLiked ? 'added' : 'removed',
      authenticated: true,
      location,
    })

    likesStoreActions.setOverride(postId, nextSnapshot)

    startTransition(async () => {
      setOptimisticState(nextSnapshot)

      const [err, result] = await togglePostLikeAction(postId)
      if (err) {
        likesStoreActions.setOverride(postId, prevSnapshot)
        handleLikeError(err)
        return
      }

      likesStoreActions.setOverride(postId, {
        isLiked: result.liked,
        likesCount: result.likesCount,
      })
    })
  }, [
    baseCount,
    baseLiked,
    getLikeErrorMessage,
    handleLikeError,
    isAuthenticated,
    location,
    optimisticState.isLiked,
    optimisticState.likesCount,
    postId,
    setOptimisticState,
    slug,
  ])

  return {
    isLiked: optimisticState.isLiked,
    likesCount: optimisticState.likesCount,
    isPending,
    toggleLike,
  }
}
