import { extractImageDimensionsFromUrl } from './optimize-inline-image'

export type UploadedImageResult =
  | {
      url: string
      width?: number
      height?: number
    }
  | string

interface NormalizedUploadedImage {
  src: string
  width: number | null
  height: number | null
}

/**
 * Normalizes the value returned by an editor image upload handler into `{ src, width, height }`,
 * falling back to `?w=` / `?h=` URL parameters when explicit dimensions are omitted.
 */
export function normalizeUploadResult(
  result: UploadedImageResult | undefined,
): NormalizedUploadedImage | null {
  if (!result) return null

  if (typeof result === 'string') {
    const extracted = extractImageDimensionsFromUrl(result)
    return {
      src: result,
      width: extracted.width,
      height: extracted.height,
    }
  }

  if (!result.url) return null
  const extracted = extractImageDimensionsFromUrl(result.url)
  return {
    src: result.url,
    width: result.width ?? extracted.width,
    height: result.height ?? extracted.height,
  }
}
