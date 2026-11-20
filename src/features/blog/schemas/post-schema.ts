import { z } from 'zod'
import { LOCALES } from '@/i18n/routing'
import { error, okay, type Result } from '@/utils/result'
import type { PostError } from '../types/errors'

const POST_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidPostSlug(slug: string): boolean {
  return POST_SLUG_REGEX.test(slug.trim())
}

export const BlogFrontmatterSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(POST_SLUG_REGEX, 'Slug must be lowercase kebab-case'),
  description: z.string().default(''),
  coverImage: z.url('Must be a valid URL').optional().or(z.literal('')),
  locale: z.enum(LOCALES).default('en'),
  translationGroupId: z.uuid('Must be a valid UUID').optional().or(z.literal('')),
  published: z.boolean().default(false),
  draft: z.boolean().default(true),
  categories: z.array(z.string()).default([]),
})

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>

export const defaultFrontmatter: BlogFrontmatter = {
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  locale: 'en',
  translationGroupId: '',
  published: false,
  draft: true,
  categories: [],
}

const postIntentSchema = z.enum(['auto_save', 'save_draft', 'publish', 'unpublish'])

/**
 * Schema for draft auto-save, manual draft save, and unpublishing.
 * Requires a non-empty title and a valid kebab-case slug, while allowing empty body content.
 */
const draftPostSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(POST_SLUG_REGEX),
  description: z.string().default(''),
  content: z.string().default(''),
  locale: z.enum(LOCALES).default('en'),
  translationGroupId: z.string().trim().optional(),
  published: z.boolean().default(false),
  draft: z.boolean().default(true),
  intent: postIntentSchema.default('save_draft'),
  categories: z.array(z.string()).default([]),
  coverImage: z.string().nullable().optional(),
})

/**
 * Strict schema for publishing a post (`intent === 'publish'`).
 * Requires non-empty `title`, valid kebab-case `slug`, and non-empty body `content`.
 */
const publishPostSchema = draftPostSchema.extend({
  content: z.string().trim().min(1),
  intent: z.literal('publish').default('publish'),
})

/**
 * Unified input schema for `savePostAction` / `savePost`.
 */
const savePostSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().default(''),
  slug: z.string().default(''),
  description: z.string().default(''),
  content: z.string().default(''),
  locale: z.string().trim().min(1).default('en'),
  translationGroupId: z.string().trim().optional(),
  published: z.boolean().default(false),
  draft: z.boolean().default(true),
  intent: postIntentSchema.default('publish'),
  categories: z.array(z.string()).default([]),
  coverImage: z.string().nullable().optional(),
})

export const discardDraftChangesSchema = z.object({
  postId: z.string().trim().min(1),
})

export const deletePostSchema = z.object({
  postId: z.string().trim().min(1),
})

export const togglePublishStatusSchema = z.object({
  postId: z.string().trim().min(1),
  published: z.boolean(),
})

export type SavePostInput = z.infer<typeof savePostSchema>
export type DiscardDraftChangesInput = z.infer<typeof discardDraftChangesSchema>
export type DeletePostInput = z.infer<typeof deletePostSchema>
export type TogglePublishStatusInput = z.infer<typeof togglePublishStatusSchema>

/**
 * Validates a post save/publish payload against `publishPostSchema` (when `intent === 'publish'`)
 * or `draftPostSchema` (when auto-saving/saving draft/unpublishing), mapping failures to typed `PostError`.
 */
export function validateSavePostInput(rawInput: unknown): Result<SavePostInput, PostError> {
  const baseParsed = savePostSchema.safeParse(rawInput)
  if (!baseParsed.success) {
    const firstIssue = baseParsed.error.issues[0]
    return error({
      reason: 'VALIDATION_ERROR',
      field: firstIssue?.path[0] ? String(firstIssue.path[0]) : undefined,
      message: firstIssue?.message,
      issues: z.flattenError(baseParsed.error).fieldErrors,
    })
  }

  const data = baseParsed.data
  const trimmedTitle = data.title.trim()
  const trimmedSlug = data.slug.trim()
  const trimmedContent = data.content.trim()

  if (!trimmedTitle) {
    return error({ reason: 'TITLE_REQUIRED' })
  }

  if (!trimmedSlug) {
    return error({ reason: 'SLUG_REQUIRED' })
  }

  if (!isValidPostSlug(trimmedSlug)) {
    return error({ reason: 'INVALID_SLUG_FORMAT', slug: trimmedSlug })
  }

  if (data.intent === 'publish') {
    if (!trimmedContent) {
      return error({ reason: 'CONTENT_REQUIRED' })
    }

    const publishParsed = publishPostSchema.safeParse({
      ...data,
      title: trimmedTitle,
      slug: trimmedSlug,
    })

    if (!publishParsed.success) {
      const firstIssue = publishParsed.error.issues[0]
      return error({
        reason: 'VALIDATION_ERROR',
        field: firstIssue?.path[0] ? String(firstIssue.path[0]) : undefined,
        message: firstIssue?.message,
        issues: z.flattenError(publishParsed.error).fieldErrors,
      })
    }

    return okay({
      ...publishParsed.data,
      content: data.content,
    })
  }

  const draftParsed = draftPostSchema.safeParse({
    ...data,
    title: trimmedTitle,
    slug: trimmedSlug,
  })

  if (!draftParsed.success) {
    const firstIssue = draftParsed.error.issues[0]
    return error({
      reason: 'VALIDATION_ERROR',
      field: firstIssue?.path[0] ? String(firstIssue.path[0]) : undefined,
      message: firstIssue?.message,
      issues: z.flattenError(draftParsed.error).fieldErrors,
    })
  }

  return okay({
    ...draftParsed.data,
    content: data.content,
  })
}
