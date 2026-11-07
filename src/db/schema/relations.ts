import { relations } from 'drizzle-orm'
import { accounts, sessions, users } from './auth'
import { categories, comments, postBookmarks, posts, postsToCategories } from './blog'

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts, { relationName: 'post_author' }),
  modifiedPosts: many(posts, { relationName: 'post_last_editor' }),
  comments: many(comments),
  bookmarks: many(postBookmarks),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const postsRelations = relations(posts, ({ many, one }) => ({
  postCategories: many(postsToCategories),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
    relationName: 'post_author',
  }),
  lastEditor: one(users, {
    fields: [posts.lastModifiedBy],
    references: [users.id],
    relationName: 'post_last_editor',
  }),
  comments: many(comments),
  bookmarks: many(postBookmarks),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postsToCategories),
}))

export const postsToCategoriesRelations = relations(postsToCategories, ({ one }) => ({
  post: one(posts, { fields: [postsToCategories.postId], references: [posts.id] }),
  category: one(categories, {
    fields: [postsToCategories.categoryId],
    references: [categories.id],
  }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comment_replies',
  }),
  replies: many(comments, {
    relationName: 'comment_replies',
  }),
}))

export const postBookmarksRelations = relations(postBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [postBookmarks.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postBookmarks.postId],
    references: [posts.id],
  }),
}))
