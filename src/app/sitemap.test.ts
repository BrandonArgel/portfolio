import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import sitemap from './sitemap'

describe('sitemap', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('lists static localized routes and published posts at their native locale URLs while excluding drafts', async () => {
    const author = await seedTestUser(ctx.db, { id: 'author-1', name: 'Brandon Argel' })
    const groupId = '11111111-1111-4111-8111-111111111111'
    const updatedEn = new Date('2026-03-10T12:00:00Z')
    const updatedEs = new Date('2026-03-11T15:30:00Z')

    await seedTestPost(ctx.db, {
      id: 'post-en',
      authorId: author.id,
      title: 'Architecture Guide',
      slug: 'architecture-guide',
      locale: 'en',
      published: true,
      draft: false,
      translationGroupId: groupId,
      updatedAt: updatedEn,
    })

    await seedTestPost(ctx.db, {
      id: 'post-es',
      authorId: author.id,
      title: 'Guía de Arquitectura',
      slug: 'guia-de-arquitectura',
      locale: 'es',
      published: true,
      draft: false,
      translationGroupId: groupId,
      updatedAt: updatedEs,
    })

    await seedTestPost(ctx.db, {
      id: 'post-draft',
      authorId: author.id,
      title: 'Unpublished Draft',
      slug: 'unpublished-draft',
      locale: 'fr',
      published: false,
      draft: true,
    })

    const entries = await sitemap(ctx.db)
    const urls = entries.map((entry) => entry.url)

    // 7 static routes across 3 locales (en, es, fr) = 21 static entries
    expect(urls.some((url) => url.endsWith('/en'))).toBe(true)
    expect(urls.some((url) => url.endsWith('/es/blog'))).toBe(true)
    expect(urls.some((url) => url.endsWith('/fr/contact'))).toBe(true)

    // Published posts appear at their native post.locale URL
    const enPostEntry = entries.find((entry) => entry.url.endsWith('/en/blog/architecture-guide'))
    const esPostEntry = entries.find((entry) => entry.url.endsWith('/es/blog/guia-de-arquitectura'))

    expect(enPostEntry).toBeDefined()
    expect(enPostEntry?.lastModified).toEqual(updatedEn)
    expect(enPostEntry?.alternates?.languages?.en).toEndWith('/en/blog/architecture-guide')
    expect(enPostEntry?.alternates?.languages?.es).toEndWith('/es/blog/guia-de-arquitectura')

    expect(esPostEntry).toBeDefined()
    expect(esPostEntry?.lastModified).toEqual(updatedEs)

    // Draft post must not appear in sitemap
    expect(urls.some((url) => url.includes('unpublished-draft'))).toBe(false)
  })
})
