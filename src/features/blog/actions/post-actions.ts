'use server'

import { eq, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { ActionError, adminActionClient, editorActionClient } from '@/lib/safe-action'

const savePostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().default(''),
  content: z.string().default(''),
  locale: z.string().min(1, 'Locale is required'),
  translationGroupId: z.string().optional(),
  published: z.boolean().default(false),
  draft: z.boolean().default(true),
  intent: z.enum(['auto_save', 'save_draft', 'publish', 'unpublish']).default('publish'),
  categories: z.array(z.string()).default([]),
  coverImage: z.string().nullable().optional(),
})

export const savePostAction = editorActionClient
  .inputSchema(savePostSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      id,
      title,
      slug,
      description,
      content,
      locale,
      translationGroupId,
      intent,
      categories: categoryNames,
      coverImage,
    } = parsedInput

    try {
      let postId = id
      const finalTranslationGroupId = translationGroupId || crypto.randomUUID()
      const now = new Date()

      let nextPublished = false
      let nextDraft = true

      if (postId) {
        // Verify ownership: only admins or the original author can update
        const existingPost = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
          columns: {
            authorId: true,
            content: true,
            draftContent: true,
            published: true,
          },
        })

        if (!existingPost) {
          throw new ActionError('Post Not Found', 'The post you are trying to edit does not exist.')
        }

        if (ctx.user.role !== 'admin' && existingPost.authorId !== ctx.user.id) {
          throw new ActionError('Insufficient Permissions', 'You can only edit your own posts.')
        }

        let nextContent = existingPost.content
        let nextDraftContent: string | null = existingPost.draftContent

        if (intent === 'publish') {
          // State B: Publish or Publish Changes -> promote draftContent/content to live content
          nextPublished = true
          nextDraft = false
          nextContent = content
          nextDraftContent = null
        } else if (intent === 'unpublish') {
          // Transition to State A (Unpublished Draft): preserve content in draftContent
          nextPublished = false
          nextDraft = true
          nextContent = existingPost.content || content
          nextDraftContent = content || existingPost.draftContent || existingPost.content
        } else if (existingPost.published) {
          // State C: Editing an already published post (15s auto-save or manual draft save)
          // Write ONLY to draftContent, leaving live content untouched
          nextPublished = true
          nextDraft = true
          nextContent = existingPost.content
          nextDraftContent = content
        } else {
          // State A: Saving an unpublished draft
          nextPublished = false
          nextDraft = true
          nextContent = content
          nextDraftContent = content
        }

        await db
          .update(posts)
          .set({
            title,
            slug,
            description,
            content: nextContent,
            draftContent: nextDraftContent,
            coverImage: coverImage ?? null,
            locale,
            translationGroupId: finalTranslationGroupId,
            published: nextPublished,
            draft: nextDraft,
            lastModifiedBy: ctx.user.id,
            updatedAt: now,
          })
          .where(eq(posts.id, postId))

        await db.delete(postsToCategories).where(eq(postsToCategories.postId, postId))
      } else {
        if (intent === 'publish') {
          // State B: Direct publish of a new post
          nextPublished = true
          nextDraft = false
        } else {
          // State A: New unpublished draft
          nextPublished = false
          nextDraft = true
        }

        const [newPost] = await db
          .insert(posts)
          .values({
            title,
            slug,
            description,
            content,
            draftContent: nextDraft ? content : null,
            coverImage: coverImage ?? null,
            locale,
            translationGroupId: finalTranslationGroupId,
            published: nextPublished,
            draft: nextDraft,
            authorId: ctx.user.id,
            lastModifiedBy: ctx.user.id,
            updatedAt: now,
          })
          .returning({ id: posts.id })

        postId = newPost.id
      }

      if (categoryNames.length > 0) {
        for (const categoryName of categoryNames) {
          const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-')

          let category = await db.query.categories.findFirst({
            // Check both slug and name to be safe against case-mismatches
            where: or(eq(categories.slug, categorySlug), eq(categories.name, categoryName)),
          })

          if (!category) {
            // Attempt a safe insert that won't crash if a constraint fails
            const inserted = await db
              .insert(categories)
              .values({ name: categoryName, slug: categorySlug })
              .onConflictDoNothing({ target: categories.name })
              .returning()

            if (inserted.length > 0) {
              category = inserted[0]
            } else {
              // If the insert was skipped (conflict occurred but was hidden), fetch it safely
              const existing = await db.query.categories.findFirst({
                where: or(eq(categories.slug, categorySlug), eq(categories.name, categoryName)),
              })

              if (!existing) {
                throw new Error(`Failed to insert or retrieve category: ${categoryName}`)
              }
              category = existing
            }
          }

          await db
            .insert(postsToCategories)
            .values({
              postId: postId,
              categoryId: category.id,
            })
            .onConflictDoNothing()
        }
      }

      if (intent !== 'auto_save') {
        revalidatePath('/blog')
        revalidatePath(`/blog/${slug}`)
        revalidatePath('/dashboard/posts')
      }

      return {
        success: true,
        postId,
        slug,
        published: nextPublished,
        draft: nextDraft,
        updatedAt: now.toISOString(),
        lastEditorName: ctx.user.name,
      }
    } catch (error) {
      console.error('Error saving post:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to save post',
        error instanceof Error ? error.message : 'An unexpected database error occurred.',
      )
    }
  })

const discardDraftChangesSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
})

export const discardDraftChangesAction = editorActionClient
  .inputSchema(discardDraftChangesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { postId } = parsedInput

    try {
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      })

      if (!existingPost) {
        throw new ActionError('Post Not Found', 'The post you are trying to update does not exist.')
      }

      if (ctx.user.role !== 'admin' && existingPost.authorId !== ctx.user.id) {
        throw new ActionError('Insufficient Permissions', 'You can only update your own posts.')
      }

      const now = new Date()

      await db
        .update(posts)
        .set({
          draftContent: null,
          draft: false,
          lastModifiedBy: ctx.user.id,
          updatedAt: now,
        })
        .where(eq(posts.id, postId))

      revalidatePath(`/dashboard/posts/${existingPost.slug}/edit`)

      return {
        success: true,
        postId,
        content: existingPost.content,
        published: existingPost.published,
        draft: false,
        updatedAt: now.toISOString(),
        lastEditorName: ctx.user.name,
      }
    } catch (error) {
      console.error('Error discarding draft changes:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to discard draft changes',
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

const togglePublishStatusSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  published: z.boolean(),
})

export const togglePublishStatusAction = editorActionClient
  .inputSchema(togglePublishStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { postId, published } = parsedInput

    try {
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      })

      if (!existingPost) {
        throw new ActionError('Post Not Found', 'The post you are trying to update does not exist.')
      }

      if (ctx.user.role !== 'admin' && existingPost.authorId !== ctx.user.id) {
        throw new ActionError('Insufficient Permissions', 'You can only update your own posts.')
      }

      await db
        .update(posts)
        .set({
          published,
          draft: !published,
          content: published
            ? (existingPost.draftContent ?? existingPost.content)
            : existingPost.content,
          draftContent: published ? null : (existingPost.draftContent ?? existingPost.content),
          lastModifiedBy: ctx.user.id,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId))

      revalidatePath('/blog')
      revalidatePath(`/blog/${existingPost.slug}`)
      revalidatePath('/dashboard/posts')
      revalidatePath('/dashboard/blog')

      return { success: true, postId, published }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to update publish status',
        error instanceof Error ? error.message : 'An unexpected database error occurred.',
      )
    }
  })
