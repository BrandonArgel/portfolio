import type { UnsupportedImageFormat } from '@/config/image-upload'

export type { UnsupportedImageFormat }

export type BlogError =
  | { reason: 'NOT_FOUND'; identifier?: string }
  | { reason: 'UNAUTHORIZED' | 'FORBIDDEN' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'VALIDATION_ERROR' }

/** Domain errors for blog post queries and mutations (Result pattern). */
export type PostError =
  // Validation
  | {
      reason: 'VALIDATION_ERROR'
      field?: string
      message?: string
      issues?: Record<string, string[] | undefined>
    }
  | { reason: 'TITLE_REQUIRED' }
  | { reason: 'SLUG_REQUIRED' }
  | { reason: 'INVALID_SLUG_FORMAT'; slug?: string }
  | { reason: 'CONTENT_REQUIRED' }
  // Conflicts
  | { reason: 'DUPLICATE_POST_SLUG'; slug: string; locale?: string }
  | { reason: 'DUPLICATE_POST_TITLE'; title: string }
  // State / Lookup
  | { reason: 'POST_NOT_FOUND'; identifier?: string }
  | { reason: 'NO_DRAFT_TO_DISCARD'; identifier?: string }
  // Auth
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  // Infra
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'UNKNOWN_ERROR' }

/** Errors a read-only collection query can produce. */
export type DatabaseError = Extract<PostError, { reason: 'DATABASE_ERROR' }>

/** Errors a single-post read query can produce. Derived from `PostError` to keep a single vocabulary. */
export type PostQueryError = Extract<PostError, { reason: 'POST_NOT_FOUND' | 'DATABASE_ERROR' }>

/** Domain errors for comment queries and mutations (Result pattern). */
export type CommentError =
  | { reason: 'POST_NOT_FOUND'; identifier?: string }
  | { reason: 'PARENT_COMMENT_NOT_FOUND'; identifier?: string }
  | { reason: 'COMMENT_NOT_FOUND'; identifier?: string }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }

/** Domain errors for AI post translation operations (Result pattern). */
export type TranslatePostError =
  | { reason: 'POST_NOT_FOUND'; identifier?: string }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'AI_TRANSLATION_FAILED' }
  | { reason: 'INVALID_TRANSLATION_OUTPUT'; locale: string }
  | { reason: 'DUPLICATE_POST_SLUG'; slug: string; locale: string }
  | { reason: 'DATABASE_ERROR'; details?: unknown }

/** Every way an image upload can fail, from file selection to storage. */
export type ImageUploadError =
  // Detected on the client (and re-checked on the server) before/while validating the file
  | { reason: 'NO_FILE' }
  | { reason: 'EMPTY_FILE' }
  | { reason: 'INVALID_FILE_TYPE'; received: string }
  | { reason: 'UNSUPPORTED_FORMAT'; format: UnsupportedImageFormat }
  | { reason: 'FILE_TOO_LARGE'; maxBytes: number; actualBytes: number }
  | { reason: 'IMAGE_PROCESSING_FAILED' }
  // Transport
  | { reason: 'OFFLINE' }
  | { reason: 'NETWORK_ERROR' }
  | { reason: 'TIMEOUT' }
  | { reason: 'PAYLOAD_TOO_LARGE' }
  | { reason: 'RATE_LIMITED' }
  // Authentication / authorization
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  // Storage / fallback
  | { reason: 'STORAGE_ERROR' }
  | { reason: 'UNKNOWN_ERROR' }

/** Errors produced by validating the file itself (shared by the client and the server). */
export type ImageValidationError = Extract<
  ImageUploadError,
  {
    reason: 'NO_FILE' | 'EMPTY_FILE' | 'INVALID_FILE_TYPE' | 'UNSUPPORTED_FORMAT' | 'FILE_TOO_LARGE'
  }
>

/** Errors the server action returns directly as typed `Result` values. */
export type ImageUploadActionError =
  | ImageValidationError
  | Extract<
      ImageUploadError,
      { reason: 'UNAUTHORIZED' | 'FORBIDDEN' | 'STORAGE_ERROR' | 'UNKNOWN_ERROR' }
    >

/** Domain errors for category management operations (Result pattern). */
export type CategoryError =
  | { reason: 'CATEGORY_NOT_FOUND'; identifier?: string }
  | { reason: 'TARGET_CATEGORY_NOT_FOUND'; identifier?: string }
  | { reason: 'DUPLICATE_CATEGORY_NAME'; name: string }
  | { reason: 'DUPLICATE_CATEGORY_SLUG'; slug: string }
  | { reason: 'SAME_CATEGORY_MERGE' }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }
