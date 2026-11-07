import { isAllowedImageMimeType, MAX_IMAGE_SIZE_BYTES } from '@/config/image-upload'
import { error, okay, type Result } from '@/utils/result'
import type { ImageValidationError } from '../types'
import {
  detectUnsupportedImageFormat,
  getDeclaredMimeType,
  getFileExtension,
  resolveImageMimeType,
} from './image-mime'

/**
 * Stage 1: is this a usable image file of a supported format? (size is checked separately,
 * AFTER client-side compression, with {@link validateImageSize}).
 */
export function validateImageFormat(
  file: File | null | undefined,
): Result<File, ImageValidationError> {
  if (!file) {
    return error({ reason: 'NO_FILE' })
  }

  if (file.size === 0) {
    return error({ reason: 'EMPTY_FILE' })
  }

  const unsupportedFormat = detectUnsupportedImageFormat(file)
  if (unsupportedFormat) {
    return error({ reason: 'UNSUPPORTED_FORMAT', format: unsupportedFormat })
  }

  const mimeType = resolveImageMimeType(file)
  if (!mimeType || !isAllowedImageMimeType(mimeType)) {
    return error({
      reason: 'INVALID_FILE_TYPE',
      received: getDeclaredMimeType(file) || getFileExtension(file.name) || 'unknown',
    })
  }

  return okay(file)
}

/** Stage 3: is the (possibly compressed) file small enough to send? */
export function validateImageSize(file: File): Result<File, ImageValidationError> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return error({
      reason: 'FILE_TOO_LARGE',
      maxBytes: MAX_IMAGE_SIZE_BYTES,
      actualBytes: file.size,
    })
  }

  return okay(file)
}

/** Full validation (format, then size). Used by the server, which receives the prepared file. */
export function validateImageFile(
  file: File | null | undefined,
): Result<File, ImageValidationError> {
  const [formatError, validFile] = validateImageFormat(file)
  if (formatError) {
    return error(formatError)
  }

  return validateImageSize(validFile)
}
