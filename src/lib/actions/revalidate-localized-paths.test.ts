import { describe, expect, mock, test } from 'bun:test'
import { LOCALES } from '@/i18n/routing'

const revalidatedPaths: string[] = []

mock.module('next/cache', () => ({
  revalidatePath: (path: string) => {
    revalidatedPaths.push(path)
  },
}))

const { revalidateLocalizedPaths } = await import('./revalidate-localized-paths')

describe('revalidateLocalizedPaths', () => {
  test('revalidates unprefixed and all locale-prefixed paths', () => {
    revalidatedPaths.length = 0

    revalidateLocalizedPaths(['/blog', '/dashboard/posts'])

    const expected = [
      '/blog',
      ...LOCALES.map((locale) => `/${locale}/blog`),
      '/dashboard/posts',
      ...LOCALES.map((locale) => `/${locale}/dashboard/posts`),
    ]

    expect(revalidatedPaths).toEqual(expected)
  })
})
