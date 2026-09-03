'use client'

import { Bookmark, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { sileo } from 'sileo'

interface ArticleCardActionsProps {
  slug: string
  title: string
}

export function ArticleCardActions({ slug, title }: ArticleCardActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const t = useTranslations('blog')

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/blog/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      sileo.success({
        title: t('actions.link_copied'),
      })
    } catch {
      sileo.error({
        title: t('actions.link_copy_error'),
      })
    }
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const next = !isBookmarked
    setIsBookmarked(next)
    sileo.success({
      title: next ? t('actions.bookmarked') : t('actions.bookmark_removed'),
      description: title,
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleShare}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label={t('actions.share')}
        title={t('actions.share')}
      >
        <Share2 className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={handleBookmark}
        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
          isBookmarked
            ? 'text-primary hover:text-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        aria-label={t('actions.bookmark')}
        title={t('actions.bookmark')}
      >
        <Bookmark className={`size-3.5 ${isBookmarked ? 'fill-primary' : ''}`} />
      </button>
    </div>
  )
}
