import { revalidatePath } from 'next/cache'
import { LOCALES } from '@/i18n/routing'

/**
 * Revalidates unprefixed and all locale-prefixed App Router paths after a mutation succeeds.
 */
export function revalidateLocalizedPaths(paths: readonly string[]): void {
  for (const path of paths) {
    revalidatePath(path)
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}${path}`)
    }
  }
}
