import { notFound } from 'next/navigation'

/**
 * Catch-all route inside `[locale]` so any unmatched path under a valid locale
 * triggers `src/app/[locale]/not-found.tsx` with full i18n, theme, and layout shell.
 */
export default function CatchAllPage() {
  notFound()
}
