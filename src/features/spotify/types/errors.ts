export type SpotifyError =
  | { reason: 'MISSING_CREDENTIALS' }
  | { reason: 'TOKEN_REFRESH_FAILED'; status?: number }
  | { reason: 'UPSTREAM_ERROR'; status: number }
  | { reason: 'NETWORK_ERROR'; details?: unknown }
  | { reason: 'INVALID_RESPONSE'; details?: unknown }
