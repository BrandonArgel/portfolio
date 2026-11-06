export type LoginError =
  | { reason: 'BANNED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'INVALID_CREDENTIALS' }
  | { reason: 'RATE_LIMITED' }
  | { reason: 'UNKNOWN_ERROR' }
  | { reason: 'UNVERIFIED_EMAIL' }

export type RegisterError =
  | { reason: 'AUTO_LOGIN_FAILED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'RATE_LIMITED' }
  | { reason: 'UNKNOWN_ERROR' }
  | { reason: 'USER_ALREADY_EXISTS' }
  | { reason: 'WEAK_PASSWORD' }
