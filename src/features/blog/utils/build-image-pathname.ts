import { IMAGE_MIME_TO_EXTENSION, isAllowedImageMimeType } from '@/config/image-upload'
import { resolveImageMimeType } from './image-mime'
import { isDeterministicCoverFileName } from './optimize-cover-image'

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
 * Builds the storage pathname. Deterministic cover variants keep their shared `<uuid>-1200.webp`
 * and `<uuid>-600.webp` filenames; all other uploads derive their extension from MIME type.
 */
export function buildImagePathname(file: File, now: number = Date.now()): string {
  const mimeType = resolveImageMimeType(file)
  if (mimeType === 'image/webp' && isDeterministicCoverFileName(file.name)) {
    return `blog-images/${file.name.toLowerCase()}`
  }

  const extension =
    mimeType && isAllowedImageMimeType(mimeType) ? IMAGE_MIME_TO_EXTENSION[mimeType] : 'bin'

  return `blog-images/${now}-${sanitizeImageBaseName(file.name)}.${extension}`
}
