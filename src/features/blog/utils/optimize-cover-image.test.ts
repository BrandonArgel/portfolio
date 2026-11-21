import { describe, expect, test } from 'bun:test'
import {
  buildCoverVariantFileNames,
  type CoverCropRect,
  calculateCoverCenterCrop,
  clampCoverCropRect,
  clampCoverPanOffset,
  computeCoverCropRectFromViewport,
  isDeterministicCoverFileName,
  isExactCoverAspectRatio,
  optimizeCoverImage,
  resolveCoverThumbnailUrl,
} from './optimize-cover-image'

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('calculateCoverCenterCrop', () => {
  test('keeps exact 1200x630 proportions with zero crop offsets', () => {
    expect(calculateCoverCenterCrop(1200, 630)).toEqual({
      sx: 0,
      sy: 0,
      sw: 1200,
      sh: 630,
    })

    expect(calculateCoverCenterCrop(2400, 1260)).toEqual({
      sx: 0,
      sy: 0,
      sw: 2400,
      sh: 1260,
    })
  })

  test('center-crops wider landscape images horizontally', () => {
    // 3000x1000 is 3:1 -> 1000 * (1200 / 630) ≈ 1905px wide centered crop
    const crop = calculateCoverCenterCrop(3000, 1000)

    expect(crop).toEqual({
      sx: 547,
      sy: 0,
      sw: 1905,
      sh: 1000,
    })
  })

  test('center-crops square and portrait images vertically', () => {
    // 1600x1600 -> 1600 / (1200 / 630) = 840px tall centered crop
    expect(calculateCoverCenterCrop(1600, 1600)).toEqual({
      sx: 0,
      sy: 380,
      sw: 1600,
      sh: 840,
    })

    // 1200x1800 -> 1200 / (1200 / 630) = 630px tall centered crop
    expect(calculateCoverCenterCrop(1200, 1800)).toEqual({
      sx: 0,
      sy: 585,
      sw: 1200,
      sh: 630,
    })
  })
})

describe('buildCoverVariantFileNames & isDeterministicCoverFileName', () => {
  test('builds shared UUID-prefixed variant names', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000'
    const names = buildCoverVariantFileNames(uuid)

    expect(names).toEqual({
      primaryName: '550e8400-e29b-41d4-a716-446655440000-1200.webp',
      thumbnailName: '550e8400-e29b-41d4-a716-446655440000-600.webp',
    })
    expect(isDeterministicCoverFileName(names.primaryName)).toBe(true)
    expect(isDeterministicCoverFileName(names.thumbnailName)).toBe(true)
    expect(isDeterministicCoverFileName('legacy-photo.webp')).toBe(false)
    expect(isDeterministicCoverFileName('550e8400-e29b-41d4-a716-446655440000-800.webp')).toBe(
      false,
    )
  })
})

describe('resolveCoverThumbnailUrl', () => {
  test('derives -600.webp from deterministic -1200.webp URLs', () => {
    const base =
      'https://abc.public.blob.vercel-storage.com/blog-images/550e8400-e29b-41d4-a716-446655440000'

    expect(resolveCoverThumbnailUrl(`${base}-1200.webp`)).toBe(`${base}-600.webp`)
    expect(resolveCoverThumbnailUrl(`  ${base}-1200.webp?v=1#cover  `)).toBe(
      `${base}-600.webp?v=1#cover`,
    )
    expect(resolveCoverThumbnailUrl('/blog-images/demo-1200.webp')).toBe(
      '/blog-images/demo-600.webp',
    )
  })

  test('falls back cleanly for legacy, external, and empty cover URLs', () => {
    expect(resolveCoverThumbnailUrl('https://cdn.example.com/cover.png')).toBe(
      'https://cdn.example.com/cover.png',
    )
    expect(resolveCoverThumbnailUrl('https://blob.example/blog-images/123-cover.webp')).toBe(
      'https://blob.example/blog-images/123-cover.webp',
    )
    expect(resolveCoverThumbnailUrl('')).toBe('')
    expect(resolveCoverThumbnailUrl(null)).toBeNull()
    expect(resolveCoverThumbnailUrl(undefined)).toBeUndefined()
  })
})

describe('optimizeCoverImage (bypass & non-browser paths)', () => {
  test.each([
    ['animated.gif', 'image/gif'],
    ['vector.svg', 'image/svg+xml'],
  ])('bypasses canvas processing for %s', async (name, type) => {
    const file = makeFile(name, type, 250_000)

    const [err, result] = await optimizeCoverImage(file)

    expect(err).toBeNull()
    expect(result).toEqual({
      primary: file,
      thumbnail: null,
      deterministic: false,
    })
  })

  test('falls back to original raster file when canvas APIs are unavailable', async () => {
    const file = makeFile('hero.png', 'image/png', 200_000)

    const [err, result] = await optimizeCoverImage(file)

    expect(err).toBeNull()
    expect(result).toEqual({
      primary: file,
      thumbnail: null,
      deterministic: false,
    })
  })
})

describe('isExactCoverAspectRatio', () => {
  test('returns true for exact and within-tolerance 1200:630 dimensions', () => {
    expect(isExactCoverAspectRatio(1200, 630)).toBe(true)
    expect(isExactCoverAspectRatio(2400, 1260)).toBe(true)
    expect(isExactCoverAspectRatio(600, 315)).toBe(true)
    expect(isExactCoverAspectRatio(1910, 1000)).toBe(true)
  })

  test('returns false for mismatched ratios or invalid dimensions', () => {
    expect(isExactCoverAspectRatio(1920, 1080)).toBe(false)
    expect(isExactCoverAspectRatio(1600, 1600)).toBe(false)
    expect(isExactCoverAspectRatio(1200, 1800)).toBe(false)
    expect(isExactCoverAspectRatio(3000, 1000)).toBe(false)
    expect(isExactCoverAspectRatio(0, 630)).toBe(false)
    expect(isExactCoverAspectRatio(1200, 0)).toBe(false)
    expect(isExactCoverAspectRatio(Number.NaN, 630)).toBe(false)
  })
})

describe('clampCoverCropRect, clampCoverPanOffset & computeCoverCropRectFromViewport', () => {
  test('clamps crop rect within natural source bounds', () => {
    expect(clampCoverCropRect({ sx: -20, sy: 15, sw: 2000, sh: 700 }, 1600, 900)).toEqual({
      sx: 0,
      sy: 15,
      sw: 1600,
      sh: 700,
    })

    expect(clampCoverCropRect({ sx: 1400, sy: 800, sw: 600, sh: 315 }, 1600, 900)).toEqual({
      sx: 1000,
      sy: 585,
      sw: 600,
      sh: 315,
    })
  })

  test('computes viewport crop matching center crop at zoom=1 and supports zoom/pan', () => {
    const centered = computeCoverCropRectFromViewport({
      naturalWidth: 1600,
      naturalHeight: 1600,
      viewportWidth: 600,
      viewportHeight: 315,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    })

    expect(centered).toEqual(calculateCoverCenterCrop(1600, 1600))

    const zoomedTopLeft = computeCoverCropRectFromViewport({
      naturalWidth: 1600,
      naturalHeight: 1600,
      viewportWidth: 600,
      viewportHeight: 315,
      zoom: 2,
      offsetX: 1000,
      offsetY: 1000,
    })

    expect(zoomedTopLeft).toEqual({
      sx: 0,
      sy: 0,
      sw: 800,
      sh: 420,
    })

    expect(
      clampCoverPanOffset(999, -999, {
        naturalWidth: 1200,
        naturalHeight: 630,
        viewportWidth: 600,
        viewportHeight: 315,
        zoom: 1,
      }),
    ).toEqual({ x: 0, y: 0 })
  })
})

describe('optimizeCoverImage with custom cropRect', () => {
  test('uses custom clamped cropRect instead of center crop for both 1200 and 600 variants', async () => {
    const drawCalls: Array<{
      sx: number
      sy: number
      sw: number
      sh: number
      dw: number
      dh: number
    }> = []

    const originalCreateImageBitmap = globalThis.createImageBitmap
    const originalDocument = globalThis.document
    let closedCount = 0

    const fakeBitmap = {
      width: 2000,
      height: 1500,
      close: () => {
        closedCount += 1
      },
    }

    const fakeDocument = {
      createElement: () => {
        let width = 0
        let height = 0
        return {
          get width() {
            return width
          },
          set width(v: number) {
            width = v
          },
          get height() {
            return height
          },
          set height(v: number) {
            height = v
          },
          getContext: () => ({
            imageSmoothingQuality: 'high',
            drawImage: (
              _img: unknown,
              sx: number,
              sy: number,
              sw: number,
              sh: number,
              _dx: number,
              _dy: number,
              dw: number,
              dh: number,
            ) => {
              drawCalls.push({ sx, sy, sw, sh, dw, dh })
            },
          }),
          toBlob: (cb: (b: Blob | null) => void, type: string) => {
            cb(new Blob([new Uint8Array(64)], { type }))
          },
        }
      },
    }

    try {
      Object.defineProperty(globalThis, 'createImageBitmap', {
        configurable: true,
        writable: true,
        value: async () => fakeBitmap,
      })
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        writable: true,
        value: fakeDocument,
      })

      const customCrop: CoverCropRect = { sx: 250, sy: 120, sw: 1200, sh: 630 }
      const [err, result] = await optimizeCoverImage(makeFile('cover.png', 'image/png'), customCrop)

      expect(err).toBeNull()
      expect(result?.deterministic).toBe(true)
      expect(isDeterministicCoverFileName(result?.primary.name ?? '')).toBe(true)
      expect(isDeterministicCoverFileName(result?.thumbnail?.name ?? '')).toBe(true)
      expect(closedCount).toBe(1)
      expect(drawCalls).toEqual([
        { sx: 250, sy: 120, sw: 1200, sh: 630, dw: 1200, dh: 630 },
        { sx: 250, sy: 120, sw: 1200, sh: 630, dw: 600, dh: 315 },
      ])
    } finally {
      Object.defineProperty(globalThis, 'createImageBitmap', {
        configurable: true,
        writable: true,
        value: originalCreateImageBitmap,
      })
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        writable: true,
        value: originalDocument,
      })
    }
  })
})
