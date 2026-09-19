export type LoginError =
  | { reason: 'INVALID_CREDENTIALS' }
  | { reason: 'UNKNOWN_ERROR' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'UNVERIFIED_EMAIL' }
  | { reason: 'BANNED' }
  | { reason: 'RATE_LIMITED' }

export type RegisterError =
  | { reason: 'USER_ALREADY_EXISTS' }
  | { reason: 'WEAK_PASSWORD' }
  | { reason: 'AUTO_LOGIN_FAILED' }
  | { reason: 'RATE_LIMITED' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'UNKNOWN_ERROR' }
