'use client'

import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { BlogInteractionLocation } from '@/lib/analytics/events'
import { cn } from '@/lib/utils'
import { usePostLike } from '../../hooks/use-post-like'

export interface LikePostButtonProps {
  postId: string
  slug: string
  initialLikesCount: number
  initialIsLiked?: boolean
  isAuthenticated?: boolean
  location: BlogInteractionLocation
  className?: string
}

export function LikePostButton({
  postId,
  slug,
  initialLikesCount,
  initialIsLiked = false,
  isAuthenticated = false,
  location,
  className,
}: LikePostButtonProps) {
  const t = useTranslations('features.blog.like')
  const { isLiked, likesCount, isPending, toggleLike } = usePostLike({
    postId,
    slug,
    initialLikesCount,
    initialIsLiked,
    isAuthenticated,
    location,
  })

  const tooltipLabel = isLiked ? t('tooltip_unlike') : t('tooltip_like')
  const ariaLabel = isLiked
    ? t('aria_unlike', { count: likesCount })
    : t('aria_like', { count: likesCount })

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleLike()
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            aria-label={ariaLabel}
            aria-pressed={isLiked}
            title={tooltipLabel}
            className={cn(
              'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:opacity-70',
              isLiked
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
              className,
            )}
          />
        }
      >
        <Heart className={cn('size-4 transition-all', isLiked && 'fill-rose-500 text-rose-500')} />
        <span className="tabular-nums">{likesCount}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipLabel}</TooltipContent>
    </Tooltip>
  )
}
