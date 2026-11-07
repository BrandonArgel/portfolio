import {
  IMAGE_EXTENSION_TO_MIME,
  UNSUPPORTED_IMAGE_EXTENSION_TO_FORMAT,
  UNSUPPORTED_IMAGE_MIME_TO_FORMAT,
  type UnsupportedImageFormat,
} from '@/config/image-upload'

type FileLike = Pick<File, 'name' | 'type'>

/** Mobile browsers sometimes report an empty type or this generic one for camera files. */
const GENERIC_MIME_TYPES = new Set(['', 'application/octet-stream'])

export function getFileExtension(name: string): string {
  const dotIndex = name.lastIndexOf('.')
  return dotIndex === -1 ? '' : name.slice(dotIndex + 1).toLowerCase()
}

/** The MIME type declared by the browser, lowercased, or `''` when absent/generic. */
export function getDeclaredMimeType(file: FileLike): string {
  const declared = file.type.trim().toLowerCase()
  return GENERIC_MIME_TYPES.has(declared) ? '' : declared
}

/**
 * Resolves the file MIME type. The declared type always wins (iOS may convert HEIC to JPEG while
 * keeping a `.heic` name); the extension is only used when the declared type is missing/generic.
 */
export function resolveImageMimeType(file: FileLike): string | null {
  const declared = getDeclaredMimeType(file)
  if (declared) return declared

  return IMAGE_EXTENSION_TO_MIME[getFileExtension(file.name)] ?? null
}

/** Detects well-known image formats that we intentionally do not accept (HEIC/HEIF/AVIF). */
export function detectUnsupportedImageFormat(file: FileLike): UnsupportedImageFormat | null {
  const declared = getDeclaredMimeType(file)
  if (declared) return UNSUPPORTED_IMAGE_MIME_TO_FORMAT[declared] ?? null

  return UNSUPPORTED_IMAGE_EXTENSION_TO_FORMAT[getFileExtension(file.name)] ?? null
}
