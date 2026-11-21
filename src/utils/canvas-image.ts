interface CanvasSourceRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

interface RenderBitmapToCanvasOptions {
  width: number
  height: number
  sourceRect?: CanvasSourceRect
}

/**
 * Checks whether browser image bitmap decoding and canvas 2D encoding APIs are available.
 */
export function canProcessCanvasImage(): boolean {
  return typeof createImageBitmap === 'function' && typeof document !== 'undefined'
}

/**
 * Decodes an image honouring EXIF orientation when supported, falling back to default decoding.
 */
export async function decodeImageBitmap(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return await createImageBitmap(file)
  }
}

/**
 * Draws a decoded bitmap (or cropped region) onto an HTML5 `<canvas>` with high-quality smoothing.
 */
export function renderBitmapToCanvas(
  bitmap: ImageBitmap,
  { width, height, sourceRect }: RenderBitmapToCanvasOptions,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context is not available')
  }

  context.imageSmoothingQuality = 'high'
  if (sourceRect) {
    context.drawImage(
      bitmap,
      sourceRect.sx,
      sourceRect.sy,
      sourceRect.sw,
      sourceRect.sh,
      0,
      0,
      width,
      height,
    )
  } else {
    context.drawImage(bitmap, 0, 0, width, height)
  }

  return canvas
}

/**
 * Encodes a canvas into a `Blob` with the requested MIME type and quality.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Encodes a canvas into an `image/webp` `Blob` at the given quality (0-1).
 */
export function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return canvasToBlob(canvas, 'image/webp', quality)
}
