'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface LocaleSwitcherProps {
  className?: string
}

export function LocaleSwitcherButtons({ className }: LocaleSwitcherProps) {
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('components.locale_switcher')

  function handleLocaleChange(nextLocale: Locale) {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <div className={cn('flex gap-1', className)}>
      {routing.locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === currentLocale ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLocaleChange(locale)}
          className={cn(
            'text-xs font-medium',
            locale === currentLocale && 'pointer-events-none',
            locale !== currentLocale && 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span className="mr-1">{locale === 'en' ? '🇺🇸' : '🇲🇽'}</span>
          {t(locale)}
        </Button>
      ))}
    </div>
  )
}
