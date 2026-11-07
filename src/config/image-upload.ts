/**
 * Single source of truth for image upload rules, shared by the client (validation,
 * compression, file pickers) and the server (`uploadImageAction`).
 */

const MB = 1024 * 1024

/** Maximum size of an image that is allowed to reach the server (checked AFTER client compression). */
export const MAX_IMAGE_SIZE_BYTES = 4 * MB

/**
 * Server Actions request body limit.
 * Keep in sync with `experimental.serverActions.bodySizeLimit` in `next.config.ts`.
 * It must be larger than `MAX_IMAGE_SIZE_BYTES` plus the multipart overhead (~10-20 KB),
 * and stay below the ~4.5 MB request cap of Vercel serverless functions.
 */
export const SERVER_BODY_SIZE_LIMIT = '4.5mb'

/** Raster images bigger than this are re-encoded on the client before uploading. */
export const COMPRESSION_THRESHOLD_BYTES = 1.5 * MB

/** Raster images with a longer side than this (in px) are downscaled on the client. */
export const MAX_IMAGE_DIMENSION_PX = 2048

/** Encoder quality (0-1) used when re-encoding to JPEG/WebP. */
export const COMPRESSION_QUALITY = 0.85

/** Maximum time to wait for the upload request before reporting a timeout. */
export const UPLOAD_TIMEOUT_MS = 60_000

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

/**
 * Raster formats that can be safely re-encoded through a canvas.
 * GIF (animation) and SVG (vector) are intentionally excluded and bypass compression.
 */
export const COMPRESSIBLE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/**
 * Value for `<input type="file" accept>`. The explicit list (instead of `image/*`) makes iOS Safari
 * convert HEIC camera-roll photos to JPEG on selection.
 */
export const IMAGE_INPUT_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(',')

export const IMAGE_EXTENSION_TO_MIME: Readonly<Record<string, AllowedImageMimeType>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

export const IMAGE_MIME_TO_EXTENSION: Readonly<Record<AllowedImageMimeType, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

export type UnsupportedImageFormat = 'heic' | 'heif' | 'avif'

export const UNSUPPORTED_IMAGE_MIME_TO_FORMAT: Readonly<Record<string, UnsupportedImageFormat>> = {
  'image/heic': 'heic',
  'image/heic-sequence': 'heic',
  'image/heif': 'heif',
  'image/heif-sequence': 'heif',
  'image/avif': 'avif',
}

export const UNSUPPORTED_IMAGE_EXTENSION_TO_FORMAT: Readonly<
  Record<string, UnsupportedImageFormat>
> = {
  heic: 'heic',
  heif: 'heif',
  avif: 'avif',
}

export function isAllowedImageMimeType(value: string): value is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(value)
}

export function isCompressibleImageMimeType(value: string): boolean {
  return (COMPRESSIBLE_IMAGE_MIME_TYPES as readonly string[]).includes(value)
}
