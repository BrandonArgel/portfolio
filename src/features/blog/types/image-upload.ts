import type { Result } from '@/utils/result'
import type { ImageUploadActionError } from './errors'

/** Where the upload was triggered from (used for telemetry). */
export type ImageUploadContext = 'inline' | 'cover'

/** Value returned by `uploadImageAction`: the shared `Result` tuple, serialized as-is. */
export type UploadImageActionResult = Result<{ url: string }, ImageUploadActionError>

/** Sends the prepared `FormData` (field `file`) to the server. May throw on transport failures. */
export type UploadTransport = (formData: FormData) => Promise<UploadImageActionResult | undefined>
