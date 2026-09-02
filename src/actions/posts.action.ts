'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { ActionError, adminActionClient, editorActionClient } from '@/lib/safe-action'

const savePostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(10, 'Content is too short'),
  locale: z.string().min(1, 'Locale is required'),
  translationGroupId: z.string().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export const savePostAction = editorActionClient
  .inputSchema(savePostSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, title, slug, content, locale, translationGroupId, published, tags } = parsedInput

    try {
      let postId = id

      const finalTranslationGroupId = translationGroupId || crypto.randomUUID()

      if (postId) {
        // Verify ownership: only admins or the original author can update
        const existingPost = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
          columns: { authorId: true },
        })

        if (!existingPost) {
          throw new ActionError('Post Not Found', 'The post you are trying to edit does not exist.')
        }

        if (ctx.user.role !== 'admin' && existingPost.authorId !== ctx.user.id) {
          throw new ActionError('Insufficient Permissions', 'You can only edit your own posts.')
        }

        await db
          .update(posts)
          .set({
            title,
            slug,
            content,
            locale,
            translationGroupId: finalTranslationGroupId,
            published,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId))

        await db.delete(postsToCategories).where(eq(postsToCategories.postId, postId))
      } else {
        const [newPost] = await db
          .insert(posts)
          .values({
            title,
            slug,
            content,
            locale,
            translationGroupId: finalTranslationGroupId,
            published,
            authorId: ctx.user.id,
          })
          .returning({ id: posts.id })

        postId = newPost.id
      }

      if (tags.length > 0) {
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')

          let category = await db.query.categories.findFirst({
            where: eq(categories.slug, tagSlug),
          })

          if (!category) {
            const [newCategory] = await db
              .insert(categories)
              .values({ name: tagName, slug: tagSlug })
              .returning()
            category = newCategory
          }

          await db.insert(postsToCategories).values({
            postId: postId,
            categoryId: category.id,
          })
        }
      }

      revalidatePath('/blog')
      revalidatePath(`/blog/${slug}`)

      return { success: true, postId, slug }
    } catch (error) {
      console.error('Error saving post:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to save post',
        error instanceof Error ? error.message : 'An unexpected database error occurred.',
      )
    }
  })

const deletePostSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
})

export const deletePostAction = adminActionClient
  .inputSchema(deletePostSchema)
  .action(async ({ parsedInput }) => {
    const { postId } = parsedInput

    try {
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      })

      if (!existingPost) {
        throw new ActionError('Post Not Found', 'The post you are trying to delete does not exist.')
      }

      await db.delete(postsToCategories).where(eq(postsToCategories.postId, postId))
      await db.delete(posts).where(eq(posts.id, postId))

      revalidatePath('/blog')
      revalidatePath('/dashboard/posts')
      revalidatePath('/dashboard/blog')

      return { success: true, postId }
    } catch (error) {
      console.error('Error deleting post:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to delete post',
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while deleting the post.',
      )
    }
  })
