'use client'

import { useCallback, useState } from 'react'
import { isCompressibleImageMimeType, MAX_IMAGE_SIZE_BYTES } from '@/config/image-upload'
import { track } from '@/lib/analytics/events'
import { error, okay } from '@/utils/result'
import { uploadImageAction } from '../actions/image-action'
import { uploadCoverImageService, uploadImageService } from '../services/image-upload-service'
import type { ImageUploadContext, UploadTransport } from '../types'
import type { CoverCropRect } from '../utils/optimize-cover-image'
import { useImageUploadErrors } from './use-image-upload-errors'

/** Binds the transport abstraction to the real server action. */
const uploadTransport: UploadTransport = (formData) => uploadImageAction(formData)

export interface UseImageUploadOptions {
  /** Where the upload was started from (telemetry and pipeline selection). */
  context: ImageUploadContext
}

interface UploadImageOptions {
  cropRect?: CoverCropRect
}

/**
 * Single entry point for every image upload in the app (inline editor images and covers).
 * Failures are reported to the user (translated toast) and to analytics (`reason` only);
 * callers only handle the success path.
 */
export function useImageUpload({ context }: UseImageUploadOptions) {
  const { handleImageUploadError } = useImageUploadErrors()
  const [pendingUploads, setPendingUploads] = useState(0)

  const upload = useCallback(
    async (file: File, options?: UploadImageOptions): Promise<string | undefined> => {
      setPendingUploads((count) => count + 1)

      try {
        const [uploadError, url] =
          context === 'cover'
            ? await uploadCoverImageService(file, {
                transport: uploadTransport,
                cropRect: options?.cropRect,
              })
            : await uploadImageService(file, {
                transport: uploadTransport,
                // Inline editor uploads run `optimizeInlineImage` before invoking `onImageUpload`.
                prepare: async (prepared) => {
                  if (
                    isCompressibleImageMimeType(prepared.type) &&
                    prepared.size > MAX_IMAGE_SIZE_BYTES
                  ) {
                    return error({ reason: 'IMAGE_PROCESSING_FAILED' })
                  }
                  return okay(prepared)
                },
              })

        if (uploadError) {
          handleImageUploadError(uploadError)
          track('Image_Upload_Failed', { reason: uploadError.reason, context })
          return undefined
        }

        return url
      } finally {
        setPendingUploads((count) => count - 1)
      }
    },
    [context, handleImageUploadError],
  )

  return { upload, isUploading: pendingUploads > 0 }
}
