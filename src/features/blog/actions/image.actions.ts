'use server'

import { put } from '@vercel/blob'
import { z } from 'zod'
import { ActionError, authActionClient } from '@/lib/safe-action'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

const uploadImageSchema = z.object({
  formData: z.instanceof(FormData),
})

export const uploadImageAction = authActionClient
  .inputSchema(uploadImageSchema)
  .action(async ({ parsedInput }) => {
    const file = parsedInput.formData.get('file')

    if (!file || !(file instanceof File)) {
      throw new ActionError(
        'Invalid file',
        'No valid image file was provided in the upload request.',
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ActionError(
        'Invalid file type',
        `Only JPEG, PNG, GIF, WebP, and SVG images are allowed. Received: ${file.type}`,
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ActionError(
        'File too large',
        `Maximum file size is 5 MB. Uploaded file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
      )
    }

    try {
      // Generate a unique path under blog-images/
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const pathname = `blog-images/${timestamp}-${safeName}`

      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      return { success: true, url: blob.url }
    } catch (error) {
      console.error('Error uploading image to Vercel Blob:', error)
      throw new ActionError(
        'Upload failed',
        error instanceof Error ? error.message : 'An unexpected error occurred during upload.',
      )
    }
  })
