import { isCompressibleImageMimeType } from '@/config/image-upload'
import { resolveImageMimeType } from '@/features/blog/utils/image-mime'
import {
  canProcessCanvasImage,
  canvasToWebpBlob,
  decodeImageBitmap,
  renderBitmapToCanvas,
} from '@/utils/canvas-image'

const INLINE_IMAGE_MAX_WIDTH_PX = 1600
const INLINE_IMAGE_WEBP_QUALITY = 0.86

const VALID_DIMENSION_PARAM_REGEX = /^[1-9]\d*$/

export interface InlineImageDimensions {
  width: number
  height: number
  scaled: boolean
}

export interface OptimizedInlineImageResult {
  file: File
  width?: number
  height?: number
}

function toWebpFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^./\\]+$/, '') || 'image'
  return `${baseName}.webp`
}

/**
 * Computes proportional inline image dimensions: scales down when `naturalWidth > 1600`
 * and never crops or upscales smaller images.
 */
export function calculateInlineImageDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth = INLINE_IMAGE_MAX_WIDTH_PX,
): InlineImageDimensions {
  const safeWidth = Math.max(1, Math.round(naturalWidth))
  const safeHeight = Math.max(1, Math.round(naturalHeight))
  const safeMaxWidth = Math.max(1, Math.round(maxWidth))

  if (safeWidth <= safeMaxWidth) {
    return {
      width: safeWidth,
      height: safeHeight,
      scaled: false,
    }
  }

  return {
    width: safeMaxWidth,
    height: Math.max(1, Math.round((safeHeight * safeMaxWidth) / safeWidth)),
    scaled: true,
  }
}

function isRelativeRootPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//')
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

/**
 * Safely appends `?w=<width>&h=<height>` metadata to absolute HTTP(S) URLs and root-relative
 * `/...` paths without throwing on relative inputs.
 */
export function appendImageDimensionsToUrl(url: string, width?: number, height?: number): string {
  if (!url || !width || !height || !Number.isFinite(width) || !Number.isFinite(height)) {
    return url
  }

  const roundedWidth = Math.round(width)
  const roundedHeight = Math.round(height)
  if (roundedWidth <= 0 || roundedHeight <= 0) {
    return url
  }

  const trimmed = url.trim()
  if (!isRelativeRootPath(trimmed) && !isAbsoluteHttpUrl(trimmed)) {
    return url
  }

  try {
    const parsed = new URL(trimmed, 'https://local.invalid')
    parsed.searchParams.set('w', String(roundedWidth))
    parsed.searchParams.set('h', String(roundedHeight))

    if (isRelativeRootPath(trimmed)) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }

    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Extracts integer `w` and `h` query parameters from absolute URLs or root-relative paths
 * for CLS-free `<img>` rendering across Tiptap and MDX views.
 */
export function extractImageDimensionsFromUrl(url: string | null | undefined): {
  width: number | null
  height: number | null
} {
  if (!url || typeof url !== 'string') {
    return { width: null, height: null }
  }

  const trimmed = url.trim()
  if (!isRelativeRootPath(trimmed) && !isAbsoluteHttpUrl(trimmed)) {
    return { width: null, height: null }
  }

  try {
    const parsed = new URL(trimmed, 'https://local.invalid')
    const rawWidth = parsed.searchParams.get('w')
    const rawHeight = parsed.searchParams.get('h')

    if (
      !rawWidth ||
      !rawHeight ||
      !VALID_DIMENSION_PARAM_REGEX.test(rawWidth) ||
      !VALID_DIMENSION_PARAM_REGEX.test(rawHeight)
    ) {
      return { width: null, height: null }
    }

    return {
      width: Number(rawWidth),
      height: Number(rawHeight),
    }
  } catch {
    return { width: null, height: null }
  }
}

/**
 * Optimizes an inline editor image before uploading while preserving its aspect ratio.
 *
 * - Completely bypasses canvas encoding for `image/svg+xml` and `image/gif`.
 * - Scales down proportionally only when `naturalWidth > 1600`.
 * - Exports WebP at `quality: 0.86` and falls back to the original file if WebP is larger.
 */
export async function optimizeInlineImage(file: File): Promise<OptimizedInlineImageResult> {
  const mimeType = resolveImageMimeType(file)

  if (!mimeType || !isCompressibleImageMimeType(mimeType) || !canProcessCanvasImage()) {
    return { file }
  }

  try {
    const bitmap = await decodeImageBitmap(file)

    try {
      const { width, height } = calculateInlineImageDimensions(bitmap.width, bitmap.height)
      const canvas = renderBitmapToCanvas(bitmap, { width, height })

      const blob = await canvasToWebpBlob(canvas, INLINE_IMAGE_WEBP_QUALITY)
      if (blob?.type !== 'image/webp' || blob.size >= file.size) {
        return {
          file,
          width: bitmap.width,
          height: bitmap.height,
        }
      }

      return {
        file: new File([blob], toWebpFileName(file.name), {
          type: 'image/webp',
          lastModified: Date.now(),
        }),
        width,
        height,
      }
    } finally {
      bitmap.close()
    }
  } catch (thrown) {
    console.warn('Inline image optimization failed, falling back to the original file:', thrown)
    return { file }
  }
}
