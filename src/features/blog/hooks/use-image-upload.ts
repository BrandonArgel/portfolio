'use client'

import { useCallback, useState } from 'react'
import { track } from '@/lib/analytics/events'
import { uploadImageAction } from '../actions/image.action'
import { uploadImageService } from '../services/image-upload-service'
import type { ImageUploadContext, UploadTransport } from '../types'
import { useImageUploadErrors } from './use-image-upload-errors'

/** Binds the transport abstraction to the real server action. */
const uploadTransport: UploadTransport = (formData) => uploadImageAction({ formData })

export interface UseImageUploadOptions {
  /** Where the upload was started from (telemetry only). */
  context: ImageUploadContext
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
    async (file: File): Promise<string | undefined> => {
      setPendingUploads((count) => count + 1)

      try {
        const [uploadError, url] = await uploadImageService(file, { transport: uploadTransport })

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
