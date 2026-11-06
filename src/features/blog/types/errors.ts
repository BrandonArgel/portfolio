export type BlogError =
  | { reason: 'NOT_FOUND'; identifier?: string }
  | { reason: 'UNAUTHORIZED' | 'FORBIDDEN' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'VALIDATION_ERROR'; message: string }

/** Errors a read-only query can produce. Derived from `BlogError` to keep a single vocabulary. */
export type PostQueryError = Extract<BlogError, { reason: 'NOT_FOUND' | 'DATABASE_ERROR' }>
