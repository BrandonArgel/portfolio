import {
  COMPRESSION_QUALITY,
  COMPRESSION_THRESHOLD_BYTES,
  IMAGE_MIME_TO_EXTENSION,
  isAllowedImageMimeType,
  isCompressibleImageMimeType,
  MAX_IMAGE_DIMENSION_PX,
  MAX_IMAGE_SIZE_BYTES,
} from '@/config/image-upload'
import {
  canProcessCanvasImage,
  canvasToBlob,
  decodeImageBitmap,
  renderBitmapToCanvas,
} from '@/utils/canvas-image'
import { error, okay, type Result } from '@/utils/result'
import type { ImageUploadError } from '../types'
import { resolveImageMimeType } from './image-mime'

export interface PrepareImageOptions {
  compressionThresholdBytes?: number
  maxDimensionPx?: number
  quality?: number
}

function withExtensionFor(fileName: string, mimeType: string): string {
  const baseName = fileName.replace(/\.[^./\\]+$/, '') || 'image'
  const extension = isAllowedImageMimeType(mimeType) ? IMAGE_MIME_TO_EXTENSION[mimeType] : null

  return extension ? `${baseName}.${extension}` : fileName
}

async function compressImage(
  file: File,
  mimeType: string,
  { compressionThresholdBytes, maxDimensionPx, quality }: Required<PrepareImageOptions>,
): Promise<File> {
  const bitmap = await decodeImageBitmap(file)

  try {
    const longestSide = Math.max(bitmap.width, bitmap.height)
    const scale = Math.min(1, maxDimensionPx / longestSide)
    const needsResize = scale < 1

    if (!needsResize && file.size <= compressionThresholdBytes) {
      return file
    }

    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = renderBitmapToCanvas(bitmap, { width, height })

    // JPEG stays JPEG. PNG/WebP go to WebP (keeps transparency); if the browser cannot encode
    // WebP, `toBlob` silently returns PNG and we keep whatever type it produced.
    const outputType = mimeType === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
    const blob = await canvasToBlob(canvas, outputType, quality)

    if (!blob) {
      throw new Error('Canvas encoding failed')
    }

    // Never make the upload bigger than the original.
    if (blob.size >= file.size) {
      return file
    }

    return new File([blob], withExtensionFor(file.name, blob.type), {
      type: blob.type,
      lastModified: Date.now(),
    })
  } finally {
    bitmap.close()
  }
}

/**
 * Stage 2: shrinks large raster photos (JPEG/PNG/WebP) before uploading.
 *
 * - GIF (animation) and SVG (vector) are never re-encoded.
 * - Missing browser support or a decoding failure is not fatal: the original is returned and the
 *   size check that follows decides. It only fails with `IMAGE_PROCESSING_FAILED` when the
 *   original is too big to be sent as-is.
 */
export async function prepareImageFile(
  file: File,
  options: PrepareImageOptions = {},
): Promise<Result<File, ImageUploadError>> {
  const mimeType = resolveImageMimeType(file)

  if (!mimeType || !isCompressibleImageMimeType(mimeType) || !canProcessCanvasImage()) {
    return okay(file)
  }

  try {
    const prepared = await compressImage(file, mimeType, {
      compressionThresholdBytes: options.compressionThresholdBytes ?? COMPRESSION_THRESHOLD_BYTES,
      maxDimensionPx: options.maxDimensionPx ?? MAX_IMAGE_DIMENSION_PX,
      quality: options.quality ?? COMPRESSION_QUALITY,
    })

    return okay(prepared)
  } catch (thrown) {
    console.warn('Image optimization failed, falling back to the original file:', thrown)

    return file.size <= MAX_IMAGE_SIZE_BYTES
      ? okay(file)
      : error({ reason: 'IMAGE_PROCESSING_FAILED' })
  }
}
