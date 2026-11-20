export type UserError =
  | { reason: 'USER_NOT_FOUND'; identifier?: string }
  | { reason: 'CANNOT_DEMOTE_SELF' }
  | { reason: 'CANNOT_BAN_SELF' }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'DATABASE_ERROR'; details?: unknown }

export type UserQueryError = Extract<UserError, { reason: 'DATABASE_ERROR' }>
