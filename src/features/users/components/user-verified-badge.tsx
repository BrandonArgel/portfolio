'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface UserVerifiedBadgeProps {
  emailVerified: boolean
}

export function UserVerifiedBadge({ emailVerified }: UserVerifiedBadgeProps) {
  const t = useTranslations('features.users.management')

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help p-1 rounded-md hover:bg-muted/50 transition-colors inline-flex">
        {emailVerified ? (
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle className="size-4 text-muted-foreground/60" />
        )}
      </TooltipTrigger>
      <TooltipContent>{emailVerified ? t('verified') : t('unverified')}</TooltipContent>
    </Tooltip>
  )
}
