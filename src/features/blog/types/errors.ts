export type SavePostError =
  | { reason: 'SLUG_ALREADY_EXISTS' }
  | { reason: 'VALIDATION_ERROR' }
  | { reason: 'UNAUTHORIZED' }
  | { reason: 'UNKNOWN_ERROR' }

export type UploadImageError =
  | { reason: 'PAYLOAD_TOO_LARGE' }
  | { reason: 'INVALID_FILE_TYPE' }
  | { reason: 'UPLOAD_FAILED' }
  | { reason: 'UNKNOWN_ERROR' }
