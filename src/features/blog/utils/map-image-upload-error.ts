import type { ImageUploadError, UploadTransportResponse } from '../types'

export interface UploadFailureEnvironment {
  /** `navigator.onLine` at the time of the failure (injected to keep the mapper pure). */
  isOnline: boolean
}

const PAYLOAD_TOO_LARGE_PATTERN =
  /body exceeded|payload too large|request entity too large|\b413\b/i
const NETWORK_ERROR_PATTERN =
  /failed to fetch|load failed|network ?error|network request failed|fetch failed/i

function getErrorName(thrown: unknown): string {
  return typeof thrown === 'object' && thrown !== null && 'name' in thrown
    ? String((thrown as { name: unknown }).name)
    : ''
}

function getErrorMessage(thrown: unknown): string {
  if (typeof thrown === 'string') return thrown
  return typeof thrown === 'object' && thrown !== null && 'message' in thrown
    ? String((thrown as { message: unknown }).message)
    : ''
}

function getErrorStatus(thrown: unknown): number | null {
  if (typeof thrown !== 'object' || thrown === null) return null
  const record = thrown as { status?: unknown; statusCode?: unknown }
  const status = record.status ?? record.statusCode
  return typeof status === 'number' ? status : null
}

/**
 * Maps a failure reported by `next-safe-action` (middleware or framework level) to a reason.
 * Expected domain failures never reach this function: the action returns them as `Result` values.
 */
export function mapActionFailure(
  response: Pick<
    UploadTransportResponse,
    'serverError' | 'validationErrors' | 'bindArgsValidationErrors'
  >,
): ImageUploadError {
  const { serverError } = response

  if (serverError) {
    const description = serverError.description?.toLowerCase() ?? ''

    if (serverError.title === 'SESSION_REVOKED') {
      return description.includes('suspend') ? { reason: 'FORBIDDEN' } : { reason: 'UNAUTHORIZED' }
    }

    if (serverError.title === 'Insufficient Permissions') {
      return { reason: 'FORBIDDEN' }
    }
  }

  return { reason: 'UNKNOWN_ERROR' }
}

/** Maps anything thrown while sending the request (network, timeout, body limit...) to a reason. */
export function mapThrownError(
  thrown: unknown,
  environment: UploadFailureEnvironment,
): ImageUploadError {
  if (!environment.isOnline) {
    return { reason: 'OFFLINE' }
  }

  const name = getErrorName(thrown)
  if (name === 'AbortError' || name === 'TimeoutError') {
    return { reason: 'TIMEOUT' }
  }

  const status = getErrorStatus(thrown)
  if (status === 429) {
    return { reason: 'RATE_LIMITED' }
  }
  if (status === 413) {
    return { reason: 'PAYLOAD_TOO_LARGE' }
  }

  const message = getErrorMessage(thrown)
  if (PAYLOAD_TOO_LARGE_PATTERN.test(message)) {
    return { reason: 'PAYLOAD_TOO_LARGE' }
  }

  if (thrown instanceof TypeError || NETWORK_ERROR_PATTERN.test(message)) {
    return { reason: 'NETWORK_ERROR' }
  }

  return { reason: 'UNKNOWN_ERROR' }
}
