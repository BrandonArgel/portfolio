// src/db/schema.ts

import { relations, sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ==========================================
// 1. AUTH (Better Auth)
// ==========================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  role: text('role').default('user').notNull(),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('banReason'),
  banExpires: integer('banExpires', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  issuer: text('issuer'),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
})

// ==========================================
// 2. BLOG TABLES
// ==========================================
export const categories = sqliteTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
})

export const posts = sqliteTable(
  'posts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    coverImage: text('cover_image'),
    published: integer('published', { mode: 'boolean' }).default(false).notNull(),
    locale: text('locale').default('en').notNull(),
    translationGroupId: text('translationGroupId'),
    authorId: text('authorId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (t) => [
    index('idx_posts_translation_group').on(t.translationGroupId),
    index('idx_posts_locale_slug').on(t.locale, t.slug),
  ],
)

export const postsToCategories = sqliteTable(
  'posts_to_categories',
  {
    postId: text('postId')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: text('categoryId')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.categoryId] })],
)

// ==========================================
// 3. RELATIONS
// ==========================================
export const postsRelations = relations(posts, ({ many, one }) => ({
  postCategories: many(postsToCategories),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postsToCategories),
}))

export const postsToCategoriesRelations = relations(postsToCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postsToCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postsToCategories.categoryId],
    references: [categories.id],
  }),
}))

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))
