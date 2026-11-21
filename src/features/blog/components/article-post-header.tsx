import { BadgeCheck, Calendar, Clock, Eye } from 'lucide-react'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { siteConfig } from '@/config/site'
import { getInitials } from '@/utils/get-initials'
import { PUBLIC_VIEWS_THRESHOLD } from '../constants/blog'

interface ArticlePostHeaderCategory {
  key: string
  name: string
}

interface ArticlePostHeaderProps {
  title: string
  categories?: readonly ArticlePostHeaderCategory[]
  authorName?: string | null
  authorImage?: string | null
  authorEmailVerified?: boolean
  authorSubtitle: string
  verifiedAuthorLabel: string
  formattedDate?: string
  dateTimeIso: string
  readTimeMinutes: number
  readTimeSuffix: string
  viewsCount?: number
  viewsCountLabel?: string
  coverImage?: string | null
  coverImageAlt?: string | null
  priorityCover?: boolean
}

function isValidCoverImageSrc(src: string): boolean {
  return src.startsWith('/') || /^https?:\/\/.+/i.test(src)
}

export function ArticlePostHeader({
  title,
  categories = [],
  authorName,
  authorImage,
  authorEmailVerified = false,
  authorSubtitle,
  verifiedAuthorLabel,
  formattedDate,
  dateTimeIso,
  readTimeMinutes,
  readTimeSuffix,
  viewsCount = 0,
  viewsCountLabel,
  coverImage,
  coverImageAlt,
  priorityCover = false,
}: ArticlePostHeaderProps) {
  const displayAuthorName = authorName || siteConfig.author.name
  const showPublicViews = viewsCount >= PUBLIC_VIEWS_THRESHOLD && Boolean(viewsCountLabel)
  const trimmedCoverImage = coverImage?.trim()
  const canRenderCoverImage = Boolean(trimmedCoverImage && isValidCoverImageSrc(trimmedCoverImage))

  return (
    <header className="mb-10 flex flex-col items-start gap-6 border-b border-border pb-10">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category.key}>{category.name}</Badge>
          ))}
        </div>
      )}

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      <div className="w-full rounded-xl border border-border/70 bg-card/50 px-4 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar size="lg">
              {authorImage && <AvatarImage src={authorImage} alt={displayAuthorName} />}
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(displayAuthorName)}
              </AvatarFallback>
            </Avatar>
            {authorEmailVerified && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <BadgeCheck
                      aria-label={verifiedAuthorLabel}
                      className="absolute bottom-0 -right-0.5 size-4 rounded-full border border-background bg-background fill-primary/25 text-primary"
                    />
                  }
                />
                <TooltipContent side="bottom">
                  <p>{verifiedAuthorLabel}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{displayAuthorName}</p>
            <p className="truncate text-xs text-muted-foreground">{authorSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground shrink-0">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <time dateTime={dateTimeIso}>{formattedDate}</time>
            </div>
          )}
          {readTimeMinutes > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span>
                {readTimeMinutes} {readTimeSuffix}
              </span>
            </div>
          )}
          {showPublicViews && (
            <div className="flex items-center gap-1.5 tabular-nums">
              <Eye className="size-4" />
              <span>{viewsCountLabel}</span>
            </div>
          )}
        </div>
      </div>

      {canRenderCoverImage && trimmedCoverImage && (
        <div className="mt-2 w-full overflow-hidden rounded-2xl shadow-md">
          <Image
            src={trimmedCoverImage}
            alt={coverImageAlt?.trim() || title}
            width={1200}
            height={630}
            priority={priorityCover}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="h-auto w-full"
          />
        </div>
      )}
    </header>
  )
}
