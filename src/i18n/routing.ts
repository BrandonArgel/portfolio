import { defineRouting } from 'next-intl/routing'

export const LOCALES = ['en', 'es', 'fr'] as const

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
