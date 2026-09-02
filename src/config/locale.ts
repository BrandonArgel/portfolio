import type { Locale } from '@/i18n/routing'

export const LOCALE_META: Record<Locale, { flag: string; nativeName: string }> = {
  en: { flag: '🇺🇸', nativeName: 'English (United States)' },
  es: { flag: '🇲🇽', nativeName: 'Español (México)' },
  fr: { flag: '🇫🇷', nativeName: 'Français (France)' },
}
