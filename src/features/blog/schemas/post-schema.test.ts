import { describe, expect, test } from 'bun:test'
import {
  BlogFrontmatterSchema,
  deletePostSchema,
  discardDraftChangesSchema,
  isValidPostSlug,
  togglePublishStatusSchema,
  validateSavePostInput,
} from './post-schema'

describe('isValidPostSlug', () => {
  test('accepts kebab-case alphanumeric slugs', () => {
    expect(isValidPostSlug('hello-world')).toBe(true)
    expect(isValidPostSlug('  next-js-16-guide  ')).toBe(true)
    expect(isValidPostSlug('a')).toBe(true)
  })

  test('rejects uppercase, spaces, underscores, and leading/trailing/double hyphens', () => {
    expect(isValidPostSlug('')).toBe(false)
    expect(isValidPostSlug('Hello-World')).toBe(false)
    expect(isValidPostSlug('hello_world')).toBe(false)
    expect(isValidPostSlug('hello--world')).toBe(false)
    expect(isValidPostSlug('-hello')).toBe(false)
    expect(isValidPostSlug('hello-')).toBe(false)
    expect(isValidPostSlug('hello world')).toBe(false)
  })
})

describe('BlogFrontmatterSchema', () => {
  test('parses valid frontmatter with defaults and optional empty cover/translationGroupId', () => {
    const parsed = BlogFrontmatterSchema.safeParse({
      title: '  Clean Architecture  ',
      slug: 'clean-architecture',
      coverImage: '',
      translationGroupId: '',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.title).toBe('Clean Architecture')
      expect(parsed.data.locale).toBe('en')
      expect(parsed.data.published).toBe(false)
      expect(parsed.data.draft).toBe(true)
      expect(parsed.data.categories).toEqual([])
    }
  })

  test('rejects invalid coverImage URLs and invalid translationGroupId UUIDs', () => {
    expect(
      BlogFrontmatterSchema.safeParse({
        title: 'Title',
        slug: 'title',
        coverImage: 'not-a-url',
      }).success,
    ).toBe(false)

    expect(
      BlogFrontmatterSchema.safeParse({
        title: 'Title',
        slug: 'title',
        translationGroupId: 'not-a-uuid',
      }).success,
    ).toBe(false)
  })
})

describe('validateSavePostInput', () => {
  test('returns VALIDATION_ERROR on non-object payload or unsupported locale', () => {
    expect(validateSavePostInput(null)[0]?.reason).toBe('VALIDATION_ERROR')

    const [localeErr] = validateSavePostInput({
      title: 'Title',
      slug: 'title',
      locale: 'de',
      intent: 'save_draft',
    })
    expect(localeErr?.reason).toBe('VALIDATION_ERROR')
  })

  test('returns TITLE_REQUIRED, SLUG_REQUIRED, and INVALID_SLUG_FORMAT in order', () => {
    expect(validateSavePostInput({ title: '   ', slug: 'valid', intent: 'publish' })[0]).toEqual({
      reason: 'TITLE_REQUIRED',
    })

    expect(validateSavePostInput({ title: 'Valid', slug: '  ', intent: 'publish' })[0]).toEqual({
      reason: 'SLUG_REQUIRED',
    })

    expect(
      validateSavePostInput({ title: 'Valid', slug: 'Bad_Slug!', intent: 'save_draft' })[0],
    ).toEqual({
      reason: 'INVALID_SLUG_FORMAT',
      slug: 'Bad_Slug!',
    })
  })

  test('requires non-empty content only when intent is publish', () => {
    expect(
      validateSavePostInput({
        title: 'My Post',
        slug: 'my-post',
        content: '   ',
        intent: 'publish',
      })[0],
    ).toEqual({ reason: 'CONTENT_REQUIRED' })

    for (const intent of ['auto_save', 'save_draft', 'unpublish'] as const) {
      const [err, data] = validateSavePostInput({
        title: '  My Post  ',
        slug: '  my-post  ',
        content: '  keep formatting\n',
        intent,
      })

      expect(err).toBeNull()
      expect(data?.title).toBe('My Post')
      expect(data?.slug).toBe('my-post')
      expect(data?.content).toBe('  keep formatting\n')
    }
  })
})

describe('auxiliary post action schemas', () => {
  test('validates discardDraftChangesSchema, deletePostSchema, togglePublishStatusSchema', () => {
    expect(discardDraftChangesSchema.safeParse({ postId: 'post-1' }).success).toBe(true)
    expect(discardDraftChangesSchema.safeParse({ postId: '   ' }).success).toBe(false)

    expect(deletePostSchema.safeParse({ postId: 'post-1' }).success).toBe(true)
    expect(deletePostSchema.safeParse({ postId: '' }).success).toBe(false)

    expect(togglePublishStatusSchema.safeParse({ postId: 'post-1', published: true }).success).toBe(
      true,
    )
    expect(
      togglePublishStatusSchema.safeParse({ postId: 'post-1', published: 'yes' }).success,
    ).toBe(false)
  })
})
