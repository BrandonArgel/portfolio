'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { eq } from 'drizzle-orm'
import matter from 'gray-matter'
import { z } from 'zod'
import { db } from '@/db'
import { posts, postsToCategories } from '@/db/schema'
import { LOCALES } from '@/i18n/routing'
import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { verifyAccess } from '@/lib/auth/verify-access'
import { error, okay, type Result } from '@/utils/result'
import { isValidPostSlug } from '../schemas/post-schema'
import type { TranslatePostError } from '../types/errors'

const translateSchema = z.object({
  postId: z.string().trim().min(1),
  targetLocales: z.array(z.enum(LOCALES)).min(1),
})

interface TranslatedPostEntry {
  locale: string
  slug: string
  id: string
}

interface TranslatePostResult {
  results: TranslatedPostEntry[]
  count: number
}

function isDuplicateSlugConstraintError(thrown: unknown): boolean {
  const message =
    thrown instanceof Error
      ? `${thrown.name} ${thrown.message} ${(thrown as { code?: string }).code ?? ''}`
      : String(thrown)
  const lower = message.toLowerCase()

  return (
    lower.includes('unique constraint failed') ||
    lower.includes('sqlite_constraint_unique') ||
    lower.includes('idx_posts_locale_slug')
  )
}

function revalidateTranslatedPostPaths() {
  revalidateLocalizedPaths(['/dashboard/posts', '/blog'])
}

export async function translatePostAction(
  input: z.infer<typeof translateSchema>,
): Promise<Result<TranslatePostResult, TranslatePostError>> {
  const [authErr, actor] = await verifyAccess('admin')
  if (authErr) return error(authErr)

  const parsed = translateSchema.safeParse(input)
  if (!parsed.success) {
    return error({ reason: 'VALIDATION_ERROR' })
  }

  const { postId, targetLocales } = parsed.data

  try {
    const originalPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: { postCategories: { with: { category: true } } },
    })

    if (!originalPost) {
      return error({ reason: 'POST_NOT_FOUND', identifier: postId })
    }

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

    const translateSingleLocale = async (
      targetLocale: (typeof LOCALES)[number],
    ): Promise<Result<TranslatedPostEntry, TranslatePostError>> => {
      const systemPrompt = `You are a Senior Software Engineer and expert technical translator.
Your task is to translate the following Markdown document to the '${targetLocale}' language.

STRICT RULES:
1. Translate the values of 'title' and 'slug' in the Frontmatter. The 'slug' must be in kebab-case format.
2. Change the value of 'locale' to '${targetLocale}'.
3. DO NOT modify the value of 'translationGroupId'.
4. DO NOT translate the tags in 'tags' (leave them in their original language to maintain the relationship in the database).
5. INSIDE CODE BLOCKS (\`\`\`): DO NOT translate programming syntax, keywords, variable names, function names, HTML tags, or file paths. ONLY translate natural language comments (e.g., //, /*, #, <!--) and user-facing string literals. Maintain exact spacing and syntax.
6. DO NOT translate the syntax of the Callouts (e.g. > [!info], > [!warning]). Translate only the descriptive text that accompanies them.
7. Return ONLY the resulting Markdown code. Do not add greetings or explanations.`

      let cleanText: string
      try {
        const { text } = await generateText({
          model: google('gemini-flash-lite-latest'),
          system: systemPrompt,
          prompt: originalMarkdown,
        })

        cleanText = text
          .replace(/^```markdown\n/, '')
          .replace(/\n```$/, '')
          .trim()
      } catch (thrown) {
        console.error(`Error translating post ${postId} to ${targetLocale}:`, thrown)
        return error({ reason: 'AI_TRANSLATION_FAILED' })
      }

      let frontmatter: Record<string, unknown>
      let translatedContent: string
      try {
        const parsedMatter = matter(cleanText)
        frontmatter = parsedMatter.data
        translatedContent = parsedMatter.content
      } catch (thrown) {
        console.error(`Error parsing translated markdown for ${targetLocale}:`, thrown)
        return error({ reason: 'INVALID_TRANSLATION_OUTPUT', locale: targetLocale })
      }
      const translatedTitle = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : ''
      const translatedSlug = typeof frontmatter.slug === 'string' ? frontmatter.slug.trim() : ''
      const resolvedLocale =
        typeof frontmatter.locale === 'string' &&
        (LOCALES as readonly string[]).includes(frontmatter.locale)
          ? frontmatter.locale
          : targetLocale

      if (!translatedTitle || !isValidPostSlug(translatedSlug) || !translatedContent.trim()) {
        return error({ reason: 'INVALID_TRANSLATION_OUTPUT', locale: targetLocale })
      }

      try {
        const [newTranslatedPost] = await db
          .insert(posts)
          .values({
            title: translatedTitle,
            slug: translatedSlug,
            content: translatedContent,
            coverImage: originalPost.coverImage,
            locale: resolvedLocale,
            translationGroupId,
            published: false,
            authorId: actor.id,
          })
          .returning({ id: posts.id, slug: posts.slug })

        if (!newTranslatedPost) {
          return error({ reason: 'DATABASE_ERROR' })
        }

        if (originalPost.postCategories.length > 0) {
          await db.insert(postsToCategories).values(
            originalPost.postCategories.map((pc) => ({
              postId: newTranslatedPost.id,
              categoryId: pc.category.id,
            })),
          )
        }

        return okay({
          locale: resolvedLocale,
          slug: newTranslatedPost.slug,
          id: newTranslatedPost.id,
        })
      } catch (thrown) {
        console.error(`Error saving translated post for locale ${targetLocale}:`, thrown)
        if (isDuplicateSlugConstraintError(thrown)) {
          return error({
            reason: 'DUPLICATE_POST_SLUG',
            slug: translatedSlug,
            locale: resolvedLocale,
          })
        }
        return error({ reason: 'DATABASE_ERROR', details: thrown })
      }
    }

    const localeResults = await Promise.all(
      targetLocales.map((targetLocale) => translateSingleLocale(targetLocale)),
    )

    const results: TranslatedPostEntry[] = []
    for (const [localeErr, entry] of localeResults) {
      if (localeErr) {
        if (results.length > 0) {
          revalidateTranslatedPostPaths()
        }
        return error(localeErr)
      }
      results.push(entry)
    }

    revalidateTranslatedPostPaths()

    return okay({
      results,
      count: results.length,
    })
  } catch (thrown) {
    console.error('Error translating post:', thrown)
    return error({ reason: 'DATABASE_ERROR', details: thrown })
  }
}
