import { isCompressibleImageMimeType, MAX_IMAGE_SIZE_BYTES } from '@/config/image-upload'
import {
  canProcessCanvasImage,
  canvasToWebpBlob,
  decodeImageBitmap,
  renderBitmapToCanvas,
} from '@/utils/canvas-image'
import { error, okay, type Result } from '@/utils/result'
import type { ImageUploadError } from '../types'
import { resolveImageMimeType } from './image-mime'

const COVER_PRIMARY_WIDTH = 1200
const COVER_PRIMARY_HEIGHT = 630
const COVER_PRIMARY_QUALITY = 0.84

export const COVER_THUMBNAIL_WIDTH = 600
export const COVER_THUMBNAIL_HEIGHT = 315
const COVER_THUMBNAIL_QUALITY = 0.82

const COVER_ASPECT_RATIO = COVER_PRIMARY_WIDTH / COVER_PRIMARY_HEIGHT
const COVER_ASPECT_RATIO_TOLERANCE = 0.01

const DETERMINISTIC_COVER_FILENAME_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(1200|600)\.webp$/i

export interface CoverCropRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface CoverViewportPanParams {
  naturalWidth: number
  naturalHeight: number
  viewportWidth: number
  viewportHeight: number
  zoom: number
}

export interface CoverViewportCropParams extends CoverViewportPanParams {
  offsetX: number
  offsetY: number
}

export interface OptimizedCoverResult {
  primary: File
  thumbnail: File | null
  deterministic: boolean
}

function generateVariantUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/**
 * Computes a centered source crop matching exact Open Graph 1200:630 (1.91:1) proportions.
 */
export function calculateCoverCenterCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth = COVER_PRIMARY_WIDTH,
  targetHeight = COVER_PRIMARY_HEIGHT,
): CoverCropRect {
  const safeWidth = Math.max(1, Math.round(sourceWidth))
  const safeHeight = Math.max(1, Math.round(sourceHeight))
  const safeTargetWidth = Math.max(1, targetWidth)
  const safeTargetHeight = Math.max(1, targetHeight)

  const sourceAspect = safeWidth / safeHeight
  const targetAspect = safeTargetWidth / safeTargetHeight

  if (sourceAspect > targetAspect) {
    const sh = safeHeight
    const sw = Math.min(safeWidth, Math.max(1, Math.round(safeHeight * targetAspect)))
    const sx = Math.floor((safeWidth - sw) / 2)
    return { sx, sy: 0, sw, sh }
  }

  const sw = safeWidth
  const sh = Math.min(safeHeight, Math.max(1, Math.round(safeWidth / targetAspect)))
  const sy = Math.floor((safeHeight - sh) / 2)
  return { sx: 0, sy, sw, sh }
}

/**
 * Checks whether natural image dimensions already match the exact 1200:630 (1.91:1)
 * cover aspect ratio within a small floating-point tolerance.
 */
export function isExactCoverAspectRatio(
  width: number,
  height: number,
  tolerance = COVER_ASPECT_RATIO_TOLERANCE,
): boolean {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false
  }
  return Math.abs(width / height - COVER_ASPECT_RATIO) <= tolerance
}

/**
 * Clamps a natural-pixel crop rectangle safely inside `[0, sourceWidth] x [0, sourceHeight]`.
 */
export function clampCoverCropRect(
  cropRect: CoverCropRect,
  sourceWidth: number,
  sourceHeight: number,
): CoverCropRect {
  const safeSourceWidth = Math.max(1, Math.round(sourceWidth))
  const safeSourceHeight = Math.max(1, Math.round(sourceHeight))

  const rawSw = Number.isFinite(cropRect.sw) ? Math.round(cropRect.sw) : safeSourceWidth
  const rawSh = Number.isFinite(cropRect.sh) ? Math.round(cropRect.sh) : safeSourceHeight
  const sw = Math.min(safeSourceWidth, Math.max(1, rawSw))
  const sh = Math.min(safeSourceHeight, Math.max(1, rawSh))

  const rawSx = Number.isFinite(cropRect.sx) ? Math.round(cropRect.sx) : 0
  const rawSy = Number.isFinite(cropRect.sy) ? Math.round(cropRect.sy) : 0
  const sx = Math.min(safeSourceWidth - sw, Math.max(0, rawSx))
  const sy = Math.min(safeSourceHeight - sh, Math.max(0, rawSy))

  return { sx, sy, sw, sh }
}

function resolveViewportDisplayMetrics(
  { naturalWidth, naturalHeight, viewportWidth, viewportHeight, zoom }: CoverViewportPanParams,
  roundNatural = false,
) {
  const safeNatW = Math.max(1, roundNatural ? Math.round(naturalWidth) : naturalWidth)
  const safeNatH = Math.max(1, roundNatural ? Math.round(naturalHeight) : naturalHeight)
  const safeViewW = Math.max(1, viewportWidth)
  const safeViewH = Math.max(1, viewportHeight)
  const safeZoom = Math.max(1, Number.isFinite(zoom) ? zoom : 1)
  const baseScale = Math.max(safeViewW / safeNatW, safeViewH / safeNatH)
  const displayScale = baseScale * safeZoom

  return { safeNatW, safeNatH, safeViewW, safeViewH, safeZoom, displayScale }
}

/**
 * Clamps drag/pan offsets in viewport CSS pixels so the image never detaches from the crop frame.
 */
export function clampCoverPanOffset(
  offsetX: number,
  offsetY: number,
  params: CoverViewportPanParams,
): { x: number; y: number } {
  const { safeNatW, safeNatH, safeViewW, safeViewH, displayScale } =
    resolveViewportDisplayMetrics(params)
  const maxOffsetX = Math.max(0, (safeNatW * displayScale - safeViewW) / 2)
  const maxOffsetY = Math.max(0, (safeNatH * displayScale - safeViewH) / 2)

  const safeOffsetX = Number.isFinite(offsetX) ? offsetX : 0
  const safeOffsetY = Number.isFinite(offsetY) ? offsetY : 0

  const clampedX = Math.min(maxOffsetX, Math.max(-maxOffsetX, safeOffsetX))
  const clampedY = Math.min(maxOffsetY, Math.max(-maxOffsetY, safeOffsetY))

  return {
    x: clampedX === 0 ? 0 : clampedX,
    y: clampedY === 0 ? 0 : clampedY,
  }
}

/**
 * Converts interactive viewport pan/zoom coordinates into natural image pixel coordinates.
 */
export function computeCoverCropRectFromViewport({
  naturalWidth,
  naturalHeight,
  viewportWidth,
  viewportHeight,
  zoom,
  offsetX,
  offsetY,
}: CoverViewportCropParams): CoverCropRect {
  const { safeNatW, safeNatH, safeViewW, safeViewH, safeZoom, displayScale } =
    resolveViewportDisplayMetrics(
      { naturalWidth, naturalHeight, viewportWidth, viewportHeight, zoom },
      true,
    )

  const clamped = clampCoverPanOffset(offsetX, offsetY, {
    naturalWidth: safeNatW,
    naturalHeight: safeNatH,
    viewportWidth: safeViewW,
    viewportHeight: safeViewH,
    zoom: safeZoom,
  })

  const imgLeft = (safeViewW - safeNatW * displayScale) / 2 + clamped.x
  const imgTop = (safeViewH - safeNatH * displayScale) / 2 + clamped.y

  return clampCoverCropRect(
    {
      sx: Math.round(-imgLeft / displayScale),
      sy: Math.round(-imgTop / displayScale),
      sw: Math.round(safeViewW / displayScale),
      sh: Math.round(safeViewH / displayScale),
    },
    safeNatW,
    safeNatH,
  )
}

/**
 * Reads an image file's natural pixel dimensions with EXIF orientation applied.
 */
export async function readImageNaturalDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap !== 'function') {
    return null
  }

  try {
    const bitmap = await decodeImageBitmap(file)
    try {
      if (bitmap.width <= 0 || bitmap.height <= 0) {
        return null
      }
      return { width: bitmap.width, height: bitmap.height }
    } finally {
      bitmap.close()
    }
  } catch {
    return null
  }
}

/**
 * Builds deterministic shared-UUID variant names for primary (1200x630) and card thumbnail (600x315).
 */
export function buildCoverVariantFileNames(uuid: string): {
  primaryName: string
  thumbnailName: string
} {
  const normalizedId = uuid.trim().toLowerCase()
  return {
    primaryName: `${normalizedId}-1200.webp`,
    thumbnailName: `${normalizedId}-600.webp`,
  }
}

export function isDeterministicCoverFileName(fileName: string): boolean {
  return DETERMINISTIC_COVER_FILENAME_REGEX.test(fileName)
}

/**
 * Derives the `-600.webp` card thumbnail URL when `coverImage` uses deterministic `-1200.webp`
 * naming, and falls back to `coverImage` unchanged for legacy or external URLs.
 */
export function resolveCoverThumbnailUrl(coverImage: string): string
export function resolveCoverThumbnailUrl(coverImage: null | undefined): null | undefined
export function resolveCoverThumbnailUrl(
  coverImage: string | null | undefined,
): string | null | undefined
export function resolveCoverThumbnailUrl(
  coverImage: string | null | undefined,
): string | null | undefined {
  if (!coverImage) return coverImage

  const trimmed = coverImage.trim()
  if (!trimmed) return coverImage

  const suffixIndex = trimmed.search(/[?#]/)
  const pathnamePart = suffixIndex === -1 ? trimmed : trimmed.slice(0, suffixIndex)
  const trailingPart = suffixIndex === -1 ? '' : trimmed.slice(suffixIndex)

  if (!pathnamePart.endsWith('-1200.webp')) {
    return coverImage
  }

  const basePath = pathnamePart.slice(0, -'-1200.webp'.length)
  return `${basePath}-600.webp${trailingPart}`
}

async function renderCoverVariantFile(
  bitmap: ImageBitmap,
  crop: CoverCropRect,
  width: number,
  height: number,
  quality: number,
  fileName: string,
): Promise<File> {
  const canvas = renderBitmapToCanvas(bitmap, { width, height, sourceRect: crop })

  const blob = await canvasToWebpBlob(canvas, quality)
  if (blob?.type !== 'image/webp') {
    throw new Error('WebP canvas encoding failed')
  }

  return new File([blob], fileName, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

/**
 * Optimizes a cover upload on the client by cropping raster images (JPEG/PNG/WebP) to
 * 1.91:1 (using `cropRect` when supplied or falling back to a centered 1200:630 crop) and
 * exporting two deterministic WebP variants (`1200x630` and `600x315`).
 *
 * SVG and GIF files bypass canvas encoding completely to preserve vectors and animation.
 */
export async function optimizeCoverImage(
  file: File,
  cropRect?: CoverCropRect,
): Promise<Result<OptimizedCoverResult, ImageUploadError>> {
  const mimeType = resolveImageMimeType(file)

  if (!mimeType || !isCompressibleImageMimeType(mimeType) || !canProcessCanvasImage()) {
    return okay({ primary: file, thumbnail: null, deterministic: false })
  }

  try {
    const bitmap = await decodeImageBitmap(file)

    try {
      const crop = cropRect
        ? clampCoverCropRect(cropRect, bitmap.width, bitmap.height)
        : calculateCoverCenterCrop(bitmap.width, bitmap.height)
      const { primaryName, thumbnailName } = buildCoverVariantFileNames(generateVariantUuid())

      const [primary, thumbnail] = await Promise.all([
        renderCoverVariantFile(
          bitmap,
          crop,
          COVER_PRIMARY_WIDTH,
          COVER_PRIMARY_HEIGHT,
          COVER_PRIMARY_QUALITY,
          primaryName,
        ),
        renderCoverVariantFile(
          bitmap,
          crop,
          COVER_THUMBNAIL_WIDTH,
          COVER_THUMBNAIL_HEIGHT,
          COVER_THUMBNAIL_QUALITY,
          thumbnailName,
        ),
      ])

      return okay({ primary, thumbnail, deterministic: true })
    } finally {
      bitmap.close()
    }
  } catch (thrown) {
    console.warn('Cover image optimization failed, falling back to the original file:', thrown)

    return file.size <= MAX_IMAGE_SIZE_BYTES
      ? okay({ primary: file, thumbnail: null, deterministic: false })
      : error({ reason: 'IMAGE_PROCESSING_FAILED' })
  }
}
