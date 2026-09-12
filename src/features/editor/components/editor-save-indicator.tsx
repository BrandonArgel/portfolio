'use client'

import { CloudCheck, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

interface SaveIndicatorProps {
  isSaving: boolean
}

export const SaveIndicator = memo(function SaveIndicator({ isSaving }: SaveIndicatorProps) {
  const t = useTranslations('features.editor')
  return (
    <div className="absolute top-4 right-6 z-10 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-border/50 shadow-sm transition-all duration-300">
      {isSaving ? (
        <>
          <Loader2 className="size-3.5 animate-spin text-primary" /> <span>{t('writing')}</span>
        </>
      ) : (
        <>
          <CloudCheck className="size-3.5 text-green-500" /> <span>{t('saved_locally')}</span>
        </>
      )}
    </div>
  )
})
