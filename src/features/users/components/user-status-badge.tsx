'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface UserStatusBadgeProps {
  banned: boolean
  banReason?: string | null
  banExpires?: Date | null
}

export function UserStatusBadge({ banned, banReason, banExpires }: UserStatusBadgeProps) {
  const t = useTranslations('features.users.management')
  const format = useFormatter()

  if (!banned) {
    return (
      <Badge variant="softGreen" className="text-xs">
        {t('active')}
      </Badge>
    )
  }

  const formattedExpires = banExpires
    ? format.dateTime(new Date(banExpires), {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : t('ban_tooltip_permanent')

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help inline-flex">
        <Badge variant="destructive" className="text-xs">
          {t('banned')}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col max-w-xs p-2.5 text-xs">
        <div className="font-semibold text-destructive-foreground">
          {t('ban_tooltip_reason')}: <span className="font-normal">{banReason || 'N/A'}</span>
        </div>
        <div>
          {t('ban_tooltip_expires')}: <span>{formattedExpires}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
