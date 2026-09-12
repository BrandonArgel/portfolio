import { relations } from 'drizzle-orm'
import { accounts, sessions, users } from './auth'
import { categories, posts, postsToCategories } from './blog'

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const postsRelations = relations(posts, ({ many, one }) => ({
  postCategories: many(postsToCategories),
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
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
