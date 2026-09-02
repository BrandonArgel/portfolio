'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { eq } from 'drizzle-orm'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { posts, postsToCategories } from '@/db/schema'
import { ActionError, adminActionClient } from '@/lib/safe-action'

const translateSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  targetLocales: z.array(z.string().min(2)).min(1, 'At least one target locale is required'),
})

export const translatePostAction = adminActionClient
  .inputSchema(translateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { postId, targetLocales } = parsedInput

    try {
      const originalPost = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: { postCategories: { with: { category: true } } },
      })

      if (!originalPost) {
        throw new ActionError(
          'Post Not Found',
          'The post you are trying to translate does not exist.',
        )
      }

      // Ensure a translationGroupId is present and assigned to the original post
      let translationGroupId = originalPost.translationGroupId
      if (!translationGroupId) {
        translationGroupId = crypto.randomUUID()
        await db
          .update(posts)
          .set({ translationGroupId, updatedAt: new Date() })
          .where(eq(posts.id, originalPost.id))
      }

      const tagsString = originalPost.postCategories.map((pc) => `"${pc.category.name}"`).join(', ')

      const originalMarkdown = `---
title: "${originalPost.title}"
slug: "${originalPost.slug}"
locale: "${originalPost.locale}"
translationGroupId: "${translationGroupId}"
published: ${originalPost.published}
tags: [${tagsString}]
---
${originalPost.content}`

      const translateSingleLocale = async (targetLocale: string) => {
        const systemPrompt = `You are a Senior Software Engineer and expert technical translator.
Your task is to translate the following Markdown document to the '${targetLocale}' language.
STRICT RULES:
1. Translate the values of 'title' and 'slug' in the Frontmatter. The 'slug' must be in kebab-case format.
2. Change the value of 'locale' to '${targetLocale}'.
3. DO NOT modify the value of 'translationGroupId'.
4. DO NOT translate the tags in 'tags' (leave them in their original language to maintain the relationship in the database).
5. DO NOT translate the code inside the code blocks (\`\`\`).
6. DO NOT translate the syntax of the Callouts (e.g. > [!info], > [!warning]). Translate only the descriptive text that accompanies them.
7. Return ONLY the resulting Markdown code. Do not add greetings or explanations.`

        const { text } = await generateText({
          model: google('gemini-flash-lite-latest'),
          system: systemPrompt,
          prompt: originalMarkdown,
        })

        const cleanText = text
          .replace(/^```markdown\n/, '')
          .replace(/\n```$/, '')
          .trim()

        const { data: frontmatter, content: translatedContent } = matter(cleanText)

        const [newTranslatedPost] = await db
          .insert(posts)
          .values({
            title: frontmatter.title,
            slug: frontmatter.slug,
            content: translatedContent,
            locale: frontmatter.locale || targetLocale,
            translationGroupId,
            published: false,
            authorId: ctx.user.id,
          })
          .returning({ id: posts.id, slug: posts.slug })

        if (originalPost.postCategories.length > 0) {
          for (const pc of originalPost.postCategories) {
            await db.insert(postsToCategories).values({
              postId: newTranslatedPost.id,
              categoryId: pc.category.id,
            })
          }
        }

        return {
          locale: targetLocale,
          slug: newTranslatedPost.slug,
          id: newTranslatedPost.id,
        }
      }

      // Execute AI requests in parallel
      const results = await Promise.all(
        targetLocales.map((targetLocale) => translateSingleLocale(targetLocale)),
      )

      revalidatePath('/dashboard/blog')
      revalidatePath('/blog')

      return {
        success: true,
        results,
        count: results.length,
      }
    } catch (error) {
      console.error('Error translating post:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Translation Failed',
        error instanceof Error ? error.message : 'The AI translation service encountered an error.',
      )
    }
  })
