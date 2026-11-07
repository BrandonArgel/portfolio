'use server'

import { put } from '@vercel/blob'
import { z } from 'zod'
import { authActionClient } from '@/lib/safe-action'
import { error, okay } from '@/utils/result'
import type { UploadImageActionResult } from '../types'
import { buildImagePathname } from '../utils/build-image-pathname'
import { resolveImageMimeType } from '../utils/image-mime'
import { validateImageFile } from '../utils/validate-image-file'

const uploadImageSchema = z.object({
  formData: z.instanceof(FormData),
})

/**
 * Uploads a blog image to Vercel Blob.
 *
 * Expected failures (invalid/oversized file, storage outage) are returned as values using the
 * shared `Result` tuple so the client can show a precise, translated message. Authentication
 * failures are still raised by `authActionClient` and mapped on the client.
 */
export const uploadImageAction = authActionClient
  .inputSchema(uploadImageSchema)
  .action(async ({ parsedInput }): Promise<UploadImageActionResult> => {
    const entry = parsedInput.formData.get('file')
    const candidate = entry instanceof File ? entry : null

    const [validationError, file] = validateImageFile(candidate)

    if (validationError) {
      // The client validates first, so reaching this means a bypassed/stale client.
      return error(validationError)
    }

    try {
      const blob = await put(buildImagePathname(file), file, {
        access: 'public',
        addRandomSuffix: true,
        contentType: resolveImageMimeType(file) ?? undefined,
      })

      return okay({ url: blob.url })
    } catch (thrown) {
      // Details stay on the server: never leak storage errors to the user.
      console.error('Error uploading image to Vercel Blob:', thrown)
      return error({ reason: 'STORAGE_ERROR' })
    }
  })
