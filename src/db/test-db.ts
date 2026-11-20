import path from 'node:path'
import { type Client, createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import type { AppDatabase } from './index'
import * as schema from './schema/index'

export interface TestDbContext {
  db: AppDatabase
  client: Client
  close: () => void
}

export async function createTestDb(): Promise<TestDbContext> {
  const client = createClient({ url: ':memory:' })
  await client.execute('PRAGMA foreign_keys = ON')
  const testDb = drizzle(client, { schema })
  await migrate(testDb, { migrationsFolder: path.resolve('src/db/migrations') })

  return {
    db: testDb,
    client,
    close: () => client.close(),
  }
}

export async function seedTestUser(
  database: AppDatabase,
  overrides: Partial<typeof schema.users.$inferInsert> = {},
) {
  const id = overrides.id ?? crypto.randomUUID()
  const [created] = await database
    .insert(schema.users)
    .values({
      id,
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? `${id}@example.com`,
      emailVerified: overrides.emailVerified ?? true,
      image: overrides.image ?? null,
      role: overrides.role ?? 'user',
      banned: overrides.banned ?? false,
      banReason: overrides.banReason ?? null,
      banExpires: overrides.banExpires ?? null,
      createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
      updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00Z'),
    })
    .returning()

  if (!created) {
    throw new Error('Failed to seed test user')
  }

  return created
}

export async function seedTestCategory(
  database: AppDatabase,
  overrides: Partial<typeof schema.categories.$inferInsert> = {},
) {
  const id = overrides.id ?? crypto.randomUUID()
  const [created] = await database
    .insert(schema.categories)
    .values({
      id,
      name: overrides.name ?? `Category ${id.slice(0, 6)}`,
      slug: overrides.slug ?? `category-${id.slice(0, 6)}`,
      description: overrides.description ?? '',
      createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
      updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00Z'),
    })
    .returning()

  if (!created) {
    throw new Error('Failed to seed test category')
  }

  return created
}

export async function seedTestPost(
  database: AppDatabase,
  overrides: { authorId: string } & Partial<typeof schema.posts.$inferInsert>,
) {
  const id = overrides.id ?? crypto.randomUUID()
  const [created] = await database
    .insert(schema.posts)
    .values({
      id,
      title: overrides.title ?? `Post ${id.slice(0, 6)}`,
      description: overrides.description ?? 'Test post description',
      slug: overrides.slug ?? `post-${id.slice(0, 6)}`,
      content: overrides.content ?? 'Sample post markdown content.',
      draftContent: overrides.draftContent ?? null,
      coverImage: overrides.coverImage ?? null,
      published: overrides.published ?? true,
      draft: overrides.draft ?? false,
      locale: overrides.locale ?? 'en',
      translationGroupId: overrides.translationGroupId ?? null,
      authorId: overrides.authorId,
      lastModifiedBy: overrides.lastModifiedBy ?? overrides.authorId,
      createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
      updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00Z'),
    })
    .returning()

  if (!created) {
    throw new Error('Failed to seed test post')
  }

  return created
}
