import type { Locale } from './routing'

export const LOCALE_META: Record<Locale, { flag: string; nativeName: string }> = {
  en: { flag: '🇺🇸', nativeName: 'English (United States)' },
  es: { flag: '🇲🇽', nativeName: 'Español (México)' },
}
