import { defineRouting } from 'next-intl/routing'

const LOCALES = ['en', 'es'] as const

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
