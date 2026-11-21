import { describe, expect, test } from 'bun:test'
import { buildImagePathname, sanitizeImageBaseName } from './build-image-pathname'

function makeFile(name: string, type: string): File {
  return new File([new Uint8Array(8)], name, { type })
}

describe('sanitizeImageBaseName', () => {
  test('strips the extension and unsafe characters', () => {
    expect(sanitizeImageBaseName('My Photo (1).final.JPG')).toBe('My_Photo_1_final')
  })

  test('never returns an empty name', () => {
    expect(sanitizeImageBaseName('....png')).toBe('image')
    expect(sanitizeImageBaseName('日本語.png')).toBe('image')
  })

  test('limits the length', () => {
    expect(sanitizeImageBaseName(`${'a'.repeat(200)}.png`).length).toBe(60)
  })
})

describe('buildImagePathname', () => {
  test('derives the extension from the MIME type, not the file name', () => {
    expect(buildImagePathname(makeFile('IMG_1.HEIC', 'image/jpeg'), 123)).toBe(
      'blog-images/123-IMG_1.jpg',
    )
  })

  test('uses the extension fallback when the type is empty', () => {
    expect(buildImagePathname(makeFile('camera.png', ''), 7)).toBe('blog-images/7-camera.png')
  })

  test('preserves deterministic shared-UUID cover filenames without timestamp prefix', () => {
    const primary = makeFile('550E8400-E29B-41D4-A716-446655440000-1200.webp', 'image/webp')
    const thumbnail = makeFile('550E8400-E29B-41D4-A716-446655440000-600.webp', 'image/webp')

    expect(buildImagePathname(primary, 999)).toBe(
      'blog-images/550e8400-e29b-41d4-a716-446655440000-1200.webp',
    )
    expect(buildImagePathname(thumbnail, 999)).toBe(
      'blog-images/550e8400-e29b-41d4-a716-446655440000-600.webp',
    )
  })
})
