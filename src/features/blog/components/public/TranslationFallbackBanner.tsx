import { Languages } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface TranslationFallbackBannerProps {
  originalLocale: string
}

export async function TranslationFallbackBanner({
  originalLocale,
}: TranslationFallbackBannerProps) {
  const t = await getTranslations('blog')

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-500 shadow-xs">
      <Languages className="size-5 shrink-0 text-amber-500" aria-hidden="true" />
      <p className="leading-relaxed font-medium">{t('fallbackWarning', { originalLocale })}</p>
    </div>
  )
}
