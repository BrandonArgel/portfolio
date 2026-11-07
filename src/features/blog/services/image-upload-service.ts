import { UPLOAD_TIMEOUT_MS } from '@/config/image-upload'
import { error, okay, type Result } from '@/utils/result'
import type { ImageUploadError, UploadTransport } from '../types'
import { mapActionFailure, mapThrownError } from '../utils/map-image-upload-error'
import { prepareImageFile } from '../utils/prepare-image-file'
import { validateImageFormat, validateImageSize } from '../utils/validate-image-file'

export interface UploadImageServiceDeps {
  /** Sends the prepared form data to the server (abstraction over the server action). */
  transport: UploadTransport
  prepare?: (file: File) => Promise<Result<File, ImageUploadError>>
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

  if (response.data) {
    const [actionError, uploaded] = response.data
    if (actionError) {
      return error(actionError)
    }

    return okay(uploaded.url)
  }

  return error(mapActionFailure(response))
}
