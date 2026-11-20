'use server'

import { put } from '@vercel/blob'
import { verifyAccess } from '@/lib/auth/verify-access'
import { assertNever, error, okay } from '@/utils/result'
import type { UploadImageActionResult } from '../types'
import { buildImagePathname } from '../utils/build-image-pathname'
import { resolveImageMimeType } from '../utils/image-mime'
import { validateImageFile } from '../utils/validate-image-file'

/**
 * Uploads a blog image to Vercel Blob.
 *
 * All auth, validation, and storage failures are returned directly as typed `Result` values
 * so callers never rely on exception interception.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadImageActionResult> {
  const [authErr] = await verifyAccess('user')
  if (authErr) {
    switch (authErr.reason) {
      case 'UNAUTHORIZED':
        return error({ reason: 'UNAUTHORIZED' })
      case 'FORBIDDEN':
        return error({ reason: 'FORBIDDEN' })
      case 'DATABASE_ERROR':
        return error({ reason: 'UNKNOWN_ERROR' })
      default:
        return assertNever(authErr)
    }
  }

  if (!(formData instanceof FormData)) {
    return error({ reason: 'NO_FILE' })
  }

  const entry = formData.get('file')
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
}
