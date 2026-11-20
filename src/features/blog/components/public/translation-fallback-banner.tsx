'use client'

import { Languages, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TranslationFallbackBannerProps {
  originalLocale: string
  className?: string
}

export function TranslationFallbackBanner({
  originalLocale,
  className,
}: TranslationFallbackBannerProps) {
  const t = useTranslations('features.blog.reader')
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-500 shadow-xs',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Languages className="size-5 shrink-0 text-amber-500" aria-hidden="true" />
        <p className="leading-relaxed font-medium">{t('fallbackWarning', { originalLocale })}</p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t('actions.dismiss')} // o "Close" si no tienes la key aún
        className="shrink-0 rounded-md p-1 text-amber-500/70 transition-colors hover:bg-amber-500/20 hover:text-amber-500 cursor-pointer"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
