import { describe, expect, test } from 'bun:test'
import { type BlogFrontmatter, defaultFrontmatter } from '../schemas/post-schema'
import type { SavePostResult } from '../services/posts-mutation-service'
import {
  applyTitleChangeToFrontmatter,
  buildSavePostInput,
  mergeSavedResultIntoFrontmatter,
  shouldOpenMetadataOnPostError,
} from './blog-composer-utils'

function makeFrontmatter(overrides: Partial<BlogFrontmatter> = {}): BlogFrontmatter {
  return {
    ...defaultFrontmatter,
    ...overrides,
  }
}

describe('applyTitleChangeToFrontmatter', () => {
  test('auto-syncs slug for a new post when slug is empty or matches previous title', () => {
    const fromEmpty = applyTitleChangeToFrontmatter(
      makeFrontmatter({ title: '', slug: '' }),
      '  Hello World!  ',
      false,
    )
    expect(fromEmpty.title).toBe('  Hello World!  ')
    expect(fromEmpty.slug).toBe('hello-world')
    expect(fromEmpty.draft).toBe(true)

    const matchingPrevious = applyTitleChangeToFrontmatter(fromEmpty, 'Hello TypeScript 5', false)
    expect(matchingPrevious.slug).toBe('hello-typescript-5')
  })

  test('preserves custom manually edited slug on a new post', () => {
    const updated = applyTitleChangeToFrontmatter(
      makeFrontmatter({ title: 'Initial Title', slug: 'custom-url-slug', draft: false }),
      'Completely Different Title',
      false,
    )

    expect(updated.title).toBe('Completely Different Title')
    expect(updated.slug).toBe('custom-url-slug')
    expect(updated.draft).toBe(true)
  })

  test('never mutates slug when editing an existing post even if slug matched the old title', () => {
    const updated = applyTitleChangeToFrontmatter(
      makeFrontmatter({ title: 'Original Post', slug: 'original-post', draft: false }),
      'Renamed Existing Post',
      true,
    )

    expect(updated.title).toBe('Renamed Existing Post')
    expect(updated.slug).toBe('original-post')
    expect(updated.draft).toBe(true)
  })
})

describe('shouldOpenMetadataOnPostError', () => {
  test('returns true for metadata error reasons and metadata validation fields', () => {
    expect(shouldOpenMetadataOnPostError({ reason: 'TITLE_REQUIRED' })).toBe(true)
    expect(shouldOpenMetadataOnPostError({ reason: 'SLUG_REQUIRED' })).toBe(true)
    expect(shouldOpenMetadataOnPostError({ reason: 'INVALID_SLUG_FORMAT', slug: 'bad!' })).toBe(
      true,
    )
    expect(shouldOpenMetadataOnPostError({ reason: 'DUPLICATE_POST_SLUG', slug: 'taken' })).toBe(
      true,
    )
    expect(
      shouldOpenMetadataOnPostError({ reason: 'VALIDATION_ERROR', field: 'canonicalUrl' }),
    ).toBe(true)
    expect(
      shouldOpenMetadataOnPostError({ reason: 'VALIDATION_ERROR', field: 'coverImageAlt' }),
    ).toBe(true)
  })

  test('returns false for non-metadata errors', () => {
    expect(shouldOpenMetadataOnPostError({ reason: 'CONTENT_REQUIRED' })).toBe(false)
    expect(shouldOpenMetadataOnPostError({ reason: 'UNAUTHORIZED' })).toBe(false)
    expect(shouldOpenMetadataOnPostError({ reason: 'DATABASE_ERROR' })).toBe(false)
    expect(shouldOpenMetadataOnPostError({ reason: 'VALIDATION_ERROR', field: 'content' })).toBe(
      false,
    )
    expect(shouldOpenMetadataOnPostError({ reason: 'VALIDATION_ERROR' })).toBe(false)
  })
})

describe('mergeSavedResultIntoFrontmatter', () => {
  test('updates server-confirmed values while retaining existing fallback metadata', () => {
    const current = makeFrontmatter({
      title: 'Draft Title',
      slug: 'draft-title',
      coverImageAlt: 'Existing alt text',
      canonicalUrl: 'https://example.com/original',
      published: false,
      draft: true,
    })

    const savedResult: SavePostResult = {
      postId: 'post-1',
      slug: 'confirmed-slug',
      previousSlug: 'draft-title',
      slugChanged: true,
      published: true,
      draft: false,
      updatedAt: '2026-11-21T14:00:00.000Z',
      lastEditorName: 'Brandon',
      post: {
        id: 'post-1',
        title: 'Confirmed Title',
        slug: 'confirmed-slug',
        locale: 'en',
        coverImageAlt: null,
        canonicalUrl: null,
        published: true,
        draft: false,
        updatedAt: '2026-11-21T14:00:00.000Z',
        lastEditorName: 'Brandon',
      },
    }

    expect(mergeSavedResultIntoFrontmatter(current, savedResult)).toEqual({
      ...current,
      title: 'Confirmed Title',
      slug: 'confirmed-slug',
      coverImageAlt: 'Existing alt text',
      canonicalUrl: 'https://example.com/original',
      published: true,
      draft: false,
    })
  })
})

describe('buildSavePostInput', () => {
  test('normalizes empty optional fields to undefined/null cleanly', () => {
    const payload = buildSavePostInput({
      postId: 'post-123',
      frontmatter: makeFrontmatter({
        title: 'My Post',
        slug: 'my-post',
        description: 'Summary',
        locale: 'es',
        translationGroupId: '',
        categories: ['engineering'],
        coverImage: '',
        coverImageAlt: '',
        canonicalUrl: '',
      }),
      content: '# Body',
      published: true,
      draft: false,
      intent: 'publish',
    })

    expect(payload).toEqual({
      id: 'post-123',
      title: 'My Post',
      slug: 'my-post',
      description: 'Summary',
      locale: 'es',
      translationGroupId: undefined,
      published: true,
      draft: false,
      intent: 'publish',
      categories: ['engineering'],
      content: '# Body',
      coverImage: null,
      coverImageAlt: null,
      canonicalUrl: null,
    })
  })
})
