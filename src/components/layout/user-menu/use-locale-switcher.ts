import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

export function useLocaleSwitcher() {
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return
    const params = new URLSearchParams(searchParams.toString())
    const query = params.toString() ? `?${params.toString()}` : ''

    startTransition(() => {
      router.replace(`${pathname}${query}`, { locale: nextLocale })
    })
  }

  return { currentLocale, changeLocale, isPending }
}
