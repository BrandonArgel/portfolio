import type { UnsupportedImageFormat } from '@/config/image-upload'

export type { UnsupportedImageFormat }

export type BlogError =
  | { reason: 'NOT_FOUND'; identifier?: string }
  | { reason: 'UNAUTHORIZED' | 'FORBIDDEN' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'VALIDATION_ERROR'; message: string }

/** Errors a read-only query can produce. Derived from `BlogError` to keep a single vocabulary. */
export type PostQueryError = Extract<BlogError, { reason: 'NOT_FOUND' | 'DATABASE_ERROR' }>

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

export type ImageUploadErrorReason = ImageUploadError['reason']

/** Errors produced by validating the file itself (shared by the client and the server). */
export type ImageValidationError = Extract<
  ImageUploadError,
  {
    reason: 'NO_FILE' | 'EMPTY_FILE' | 'INVALID_FILE_TYPE' | 'UNSUPPORTED_FORMAT' | 'FILE_TOO_LARGE'
  }
>

/** Errors the server action returns as values (everything else is detected by the client). */
export type ImageUploadActionError =
  | ImageValidationError
  | Extract<ImageUploadError, { reason: 'STORAGE_ERROR' }>

/** Domain errors for category management operations (Result pattern). */
export type CategoryError =
  | { reason: 'CATEGORY_NOT_FOUND'; identifier?: string }
  | { reason: 'TARGET_CATEGORY_NOT_FOUND'; identifier?: string }
  | { reason: 'DUPLICATE_CATEGORY_NAME'; name: string }
  | { reason: 'DUPLICATE_CATEGORY_SLUG'; slug: string }
  | { reason: 'SAME_CATEGORY_MERGE' }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'VALIDATION_ERROR'; message?: string }
  | { reason: 'DATABASE_ERROR'; details?: unknown }

export type CategoryErrorReason = CategoryError['reason']
