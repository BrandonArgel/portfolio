import { describe, expect, test } from 'bun:test'
import {
  appendImageDimensionsToUrl,
  calculateInlineImageDimensions,
  extractImageDimensionsFromUrl,
  optimizeInlineImage,
} from './optimize-inline-image'

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('calculateInlineImageDimensions', () => {
  test('never upscales images at or below max width', () => {
    expect(calculateInlineImageDimensions(800, 600)).toEqual({
      width: 800,
      height: 600,
      scaled: false,
    })

    expect(calculateInlineImageDimensions(1600, 900)).toEqual({
      width: 1600,
      height: 900,
      scaled: false,
    })
  })

  test('scales down proportionally without cropping when naturalWidth > 1600', () => {
    expect(calculateInlineImageDimensions(3200, 1800)).toEqual({
      width: 1600,
      height: 900,
      scaled: true,
    })

    // Portrait 2000x3000 -> 1600x2400
    expect(calculateInlineImageDimensions(2000, 3000)).toEqual({
      width: 1600,
      height: 2400,
      scaled: true,
    })
  })
})

describe('appendImageDimensionsToUrl & extractImageDimensionsFromUrl', () => {
  test('round-trips dimensions on absolute HTTP(S) URLs cleanly', () => {
    const withDims = appendImageDimensionsToUrl(
      'https://cdn.example.com/blog-images/chart.webp?token=abc#img',
      1600,
      900,
    )

    expect(withDims).toBe(
      'https://cdn.example.com/blog-images/chart.webp?token=abc&w=1600&h=900#img',
    )
    expect(extractImageDimensionsFromUrl(withDims)).toEqual({
      width: 1600,
      height: 900,
    })
  })

  test('handles root-relative paths safely without throwing in new URL()', () => {
    const withDims = appendImageDimensionsToUrl('/blog-images/diagram.webp', 1200, 800)

    expect(withDims).toBe('/blog-images/diagram.webp?w=1200&h=800')
    expect(extractImageDimensionsFromUrl(withDims)).toEqual({
      width: 1200,
      height: 800,
    })
  })

  test('ignores non-URL schemes and malformed dimension values safely', () => {
    expect(appendImageDimensionsToUrl('data:image/png;base64,abc', 800, 600)).toBe(
      'data:image/png;base64,abc',
    )
    expect(appendImageDimensionsToUrl('https://cdn.example.com/a.webp', undefined, 600)).toBe(
      'https://cdn.example.com/a.webp',
    )
    expect(extractImageDimensionsFromUrl('/blog-images/a.webp')).toEqual({
      width: null,
      height: null,
    })
    expect(extractImageDimensionsFromUrl('/blog-images/a.webp?w=-10&h=abc')).toEqual({
      width: null,
      height: null,
    })
    expect(extractImageDimensionsFromUrl('//protocol-relative/a.webp?w=100&h=100')).toEqual({
      width: null,
      height: null,
    })
    expect(extractImageDimensionsFromUrl(null)).toEqual({
      width: null,
      height: null,
    })
  })
})

describe('optimizeInlineImage (bypass & non-browser paths)', () => {
  test.each([
    ['animation.gif', 'image/gif'],
    ['diagram.svg', 'image/svg+xml'],
  ])('bypasses canvas encoding completely for %s', async (name, type) => {
    const file = makeFile(name, type, 150_000)

    const result = await optimizeInlineImage(file)

    expect(result).toEqual({ file })
  })

  test('returns the original file when canvas APIs are unavailable', async () => {
    const file = makeFile('screenshot.png', 'image/png', 150_000)

    const result = await optimizeInlineImage(file)

    expect(result).toEqual({ file })
  })
})
