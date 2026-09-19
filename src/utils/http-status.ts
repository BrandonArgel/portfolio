export function getHttpStatusFromError(reason: string): number {
  switch (reason) {
    case 'NOT_FOUND':
      return 404
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'BAD_REQUEST':
    case 'VALIDATION_ERROR':
      return 400
    default:
      return 500
  }
}
