import { UPLOAD_TIMEOUT_MS } from '@/config/image-upload'
import { error, isErrorResult, okay, type Result } from '@/utils/result'
import type { ImageUploadError, UploadTransport } from '../types'
import { mapThrownError } from '../utils/map-image-upload-error'
import {
  type CoverCropRect,
  type OptimizedCoverResult,
  optimizeCoverImage,
} from '../utils/optimize-cover-image'
import { prepareImageFile } from '../utils/prepare-image-file'
import { validateImageFormat, validateImageSize } from '../utils/validate-image-file'

export interface UploadImageServiceDeps {
  /** Sends the prepared form data to the server (abstraction over the server action). */
  transport: UploadTransport
  prepare?: (file: File) => Promise<Result<File, ImageUploadError>>
  isOnline?: () => boolean
  timeoutMs?: number
}

export interface UploadCoverImageServiceDeps {
  /** Sends each prepared cover variant to the server (abstraction over the server action). */
  transport: UploadTransport
  cropRect?: CoverCropRect
  optimize?: (
    file: File,
    cropRect?: CoverCropRect,
  ) => Promise<Result<OptimizedCoverResult, ImageUploadError>>
  isOnline?: () => boolean
  timeoutMs?: number
}

function getIsOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new DOMException('Upload timed out', 'TimeoutError')),
      timeoutMs,
    )

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (thrown: unknown) => {
        clearTimeout(timer)
        reject(thrown)
      },
    )
  })
}

async function sendPreparedFile(
  sizedFile: File,
  {
    transport,
    isOnline,
    timeoutMs,
  }: {
    transport: UploadTransport
    isOnline: () => boolean
    timeoutMs: number
  },
): Promise<Result<string, ImageUploadError>> {
  if (!isOnline()) {
    return error({ reason: 'OFFLINE' })
  }

  const formData = new FormData()
  formData.append('file', sizedFile)

  let response: Awaited<ReturnType<UploadTransport>>
  try {
    response = await withTimeout(transport(formData), timeoutMs)
  } catch (thrown) {
    return error(mapThrownError(thrown, { isOnline: isOnline() }))
  }

  if (!response) {
    return error({ reason: 'UNKNOWN_ERROR' })
  }

  const [actionError, uploaded] = response
  if (actionError) {
    return error(actionError)
  }

  return okay(uploaded.url)
}

/**
 * Validates, optimizes and uploads an image, returning its public URL.
 *
 * Order matters: the file type is checked first, then the image is compressed, and only then is
 * the size checked, so a 6 MB phone photo that shrinks to 400 KB uploads without complaint.
 * Every failure is a typed `ImageUploadError`; this function never throws.
 */
export async function uploadImageService(
  file: File | null | undefined,
  {
    transport,
    prepare = prepareImageFile,
    isOnline = getIsOnline,
    timeoutMs = UPLOAD_TIMEOUT_MS,
  }: UploadImageServiceDeps,
): Promise<Result<string, ImageUploadError>> {
  // 1. Presence, emptiness and format (MIME/extension)
  const [formatError, validFile] = validateImageFormat(file)
  if (formatError) {
    return error(formatError)
  }

  // 2. Compress / resize large raster photos
  const [prepareError, preparedFile] = await prepare(validFile)
  if (prepareError) {
    return error(prepareError)
  }

  // 3. Size, AFTER compression
  const [sizeError, sizedFile] = validateImageSize(preparedFile)
  if (sizeError) {
    return error(sizeError)
  }

  return sendPreparedFile(sizedFile, { transport, isOnline, timeoutMs })
}

/**
 * Validates, center-crops into 1200x630 and 600x315 WebP variants with deterministic UUID names,
 * and uploads both cover variants concurrently so cards always have their `-600.webp` sibling.
 */
export async function uploadCoverImageService(
  file: File | null | undefined,
  {
    transport,
    cropRect,
    optimize = optimizeCoverImage,
    isOnline = getIsOnline,
    timeoutMs = UPLOAD_TIMEOUT_MS,
  }: UploadCoverImageServiceDeps,
): Promise<Result<string, ImageUploadError>> {
  const [formatError, validFile] = validateImageFormat(file)
  if (formatError) {
    return error(formatError)
  }

  const [optimizeError, optimized] = await optimize(validFile, cropRect)
  if (optimizeError) {
    return error(optimizeError)
  }

  const [primarySizeError, sizedPrimary] = validateImageSize(optimized.primary)
  if (primarySizeError) {
    return error(primarySizeError)
  }

  let sizedThumbnail: File | null = null
  if (optimized.thumbnail) {
    const [thumbSizeError, validThumb] = validateImageSize(optimized.thumbnail)
    if (thumbSizeError) {
      return error(thumbSizeError)
    }
    sizedThumbnail = validThumb
  }

  if (!sizedThumbnail) {
    return sendPreparedFile(sizedPrimary, { transport, isOnline, timeoutMs })
  }

  const [primaryResult, thumbnailResult] = await Promise.all([
    sendPreparedFile(sizedPrimary, { transport, isOnline, timeoutMs }),
    sendPreparedFile(sizedThumbnail, { transport, isOnline, timeoutMs }),
  ])

  if (isErrorResult(primaryResult)) {
    return error(primaryResult[0])
  }

  if (isErrorResult(thumbnailResult)) {
    return error(thumbnailResult[0])
  }

  return okay(primaryResult[1])
}
