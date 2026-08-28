'use client'

import { Cookie, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { setCookieConsent } from '@/actions/cookies'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const t = useTranslations('components.cookie_banner')
  const tGlobal = useTranslations('common.actions')

  const handleAccept = async () => {
    setIsVisible(false)
    await setCookieConsent(true)

    // Tracking and analytics scripts
  }

  const handleDismiss = async () => {
    setIsVisible(false)
    await setCookieConsent(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-2xl -translate-x-1/2 flex-col gap-4 rounded-xl border border-border bg-background p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t('message')}{' '}
          <Link href="/legal/privacy-policy" className="underline hover:text-primary">
            {t('privacy_policy')}
          </Link>
          .
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={handleAccept}>
          {tGlobal('accept')}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDismiss}
          aria-label={t('close_banner')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
