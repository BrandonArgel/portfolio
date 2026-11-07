import { IMAGE_MIME_TO_EXTENSION, isAllowedImageMimeType } from '@/config/image-upload'
import { resolveImageMimeType } from './image-mime'

const MAX_BASE_NAME_LENGTH = 60

/** Strips the extension and any character that is not safe in a storage pathname. */
export function sanitizeImageBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./\\]+$/, '')
  const sanitized = withoutExtension
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, MAX_BASE_NAME_LENGTH)

  return sanitized || 'image'
}

/**
 * Builds the storage pathname. The extension is derived from the validated MIME type (not the
 * original file name) so e.g. a JPEG that kept a `.heic` name is stored as `.jpg`.
 */
export function buildImagePathname(file: File, now: number = Date.now()): string {
  const mimeType = resolveImageMimeType(file)
  const extension =
    mimeType && isAllowedImageMimeType(mimeType) ? IMAGE_MIME_TO_EXTENSION[mimeType] : 'bin'

  return `blog-images/${now}-${sanitizeImageBaseName(file.name)}.${extension}`
}
