import {
  type AnySQLiteColumn,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { users } from './auth'
import { baseColumns } from './common'

export const categories = sqliteTable('categories', {
  ...baseColumns,
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description').default(''),
})

export const posts = sqliteTable(
  'posts',
  {
    ...baseColumns,
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    slug: text('slug').notNull(),
    content: text('content').notNull().default(''),
    draftContent: text('draft_content'),
    coverImage: text('cover_image'),
    published: integer('published', { mode: 'boolean' }).default(false).notNull(),
    draft: integer('draft', { mode: 'boolean' }).default(true).notNull(),
    locale: text('locale').default('en').notNull(),
    translationGroupId: text('translationGroupId'),
    authorId: text('authorId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lastModifiedBy: text('lastModifiedBy').references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('idx_posts_translation_group').on(t.translationGroupId),
    uniqueIndex('idx_posts_locale_slug').on(t.locale, t.slug),
    index('idx_posts_author_id').on(t.authorId),
    index('idx_posts_last_modified_by').on(t.lastModifiedBy),
    index('idx_posts_locale_published_created_at').on(t.locale, t.published, t.createdAt),
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
  (t) => [
    primaryKey({ columns: [t.postId, t.categoryId] }),
    index('idx_posts_to_categories_category_id').on(t.categoryId),
  ],
)

export const comments = sqliteTable(
  'comments',
  {
    ...baseColumns,
    content: text('content').notNull(),
    postId: text('postId')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    authorId: text('authorId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    parentId: text('parentId').references((): AnySQLiteColumn => comments.id, {
      onDelete: 'cascade',
    }),
  },
  (t) => [
    index('idx_comments_post_id').on(t.postId),
    index('idx_comments_author_id').on(t.authorId),
    index('idx_comments_parent_id').on(t.parentId),
    index('idx_comments_post_created_at').on(t.postId, t.createdAt),
  ],
)
