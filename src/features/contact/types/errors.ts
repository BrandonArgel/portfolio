export type ContactError =
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'DELIVERY_FAILED'; details?: unknown }
  | { reason: 'UNKNOWN_ERROR' }
