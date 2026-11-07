import type { Result } from '@/utils/result'
import type { ImageUploadActionError } from './errors'

/** Where the upload was triggered from (used for telemetry). */
export type ImageUploadContext = 'inline' | 'cover'

/** Value returned by `uploadImageAction`: the shared `Result` tuple, serialized as-is. */
export type UploadImageActionResult = Result<{ url: string }, ImageUploadActionError>

/**
 * Structural subset of the `next-safe-action` response consumed by the upload service.
 * Keeping it structural lets the service depend on an abstraction instead of the action itself.
 */
export interface UploadTransportResponse {
  data?: UploadImageActionResult
  serverError?: { title: string; description?: string }
  validationErrors?: unknown
  bindArgsValidationErrors?: unknown
}

/** Sends the prepared `FormData` (field `file`) to the server. May throw on transport failures. */
export type UploadTransport = (formData: FormData) => Promise<UploadTransportResponse | undefined>
