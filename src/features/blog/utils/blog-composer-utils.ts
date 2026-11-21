import { generateSlug } from '@/utils/string-utils'
import type { BlogFrontmatter, SavePostInput } from '../schemas/post-schema'
import type { SavePostResult } from '../services/posts-mutation-service'
import type { PostError } from '../types/errors'

const METADATA_ERROR_REASONS = new Set<PostError['reason']>([
  'TITLE_REQUIRED',
  'SLUG_REQUIRED',
  'INVALID_SLUG_FORMAT',
  'DUPLICATE_POST_SLUG',
])

const METADATA_VALIDATION_FIELDS = new Set(['canonicalUrl', 'coverImageAlt'])

function normalizeSlugEdges(value: string): string {
  return generateSlug(value).replace(/^-+|-+$/g, '')
}

/**
 * Returns `true` when a post validation or save error corresponds to fields inside the metadata
 * inspector/sheet so the UI can reveal those fields automatically.
 */
export function shouldOpenMetadataOnPostError(err: PostError): boolean {
  if (METADATA_ERROR_REASONS.has(err.reason)) {
    return true
  }

  return (
    err.reason === 'VALIDATION_ERROR' &&
    typeof err.field === 'string' &&
    METADATA_VALIDATION_FIELDS.has(err.field)
  )
}

/**
 * Applies a title edit to frontmatter while preserving the invariant that existing posts never
 * silently mutate their URL slug when their title is edited.
 */
export function applyTitleChangeToFrontmatter(
  frontmatter: BlogFrontmatter,
  newTitle: string,
  isExistingPost: boolean,
): BlogFrontmatter {
  const currentGeneratedSlug = normalizeSlugEdges(frontmatter.title)
  const shouldAutoSyncSlug =
    !isExistingPost && (!frontmatter.slug || frontmatter.slug === currentGeneratedSlug)

  return {
    ...frontmatter,
    title: newTitle,
    slug: shouldAutoSyncSlug ? normalizeSlugEdges(newTitle) : frontmatter.slug,
    draft: true,
  }
}

/**
 * Merges server-confirmed post fields back into local composer frontmatter after a save succeeds.
 */
export function mergeSavedResultIntoFrontmatter(
  currentFrontmatter: BlogFrontmatter,
  result: SavePostResult,
): BlogFrontmatter {
  return {
    ...currentFrontmatter,
    title: result.post.title,
    slug: result.post.slug,
    coverImageAlt: result.post.coverImageAlt ?? currentFrontmatter.coverImageAlt,
    canonicalUrl: result.post.canonicalUrl ?? currentFrontmatter.canonicalUrl,
    published: result.published,
    draft: result.draft,
  }
}

interface BuildSavePostInputParams {
  postId?: string
  frontmatter: BlogFrontmatter
  content: string
  published: boolean
  draft: boolean
  intent: SavePostInput['intent']
}

/**
 * Builds a normalized `SavePostInput` payload from composer state, mapping empty optional
 * strings to `undefined` or `null` consistently across manual saves, auto-saves, and publishing.
 */
export function buildSavePostInput({
  postId,
  frontmatter,
  content,
  published,
  draft,
  intent,
}: BuildSavePostInputParams): SavePostInput {
  return {
    id: postId,
    title: frontmatter.title,
    slug: frontmatter.slug,
    description: frontmatter.description,
    locale: frontmatter.locale,
    translationGroupId: frontmatter.translationGroupId || undefined,
    published,
    draft,
    intent,
    categories: frontmatter.categories,
    content,
    coverImage: frontmatter.coverImage || null,
    coverImageAlt: frontmatter.coverImageAlt || null,
    canonicalUrl: frontmatter.canonicalUrl || null,
  }
}
