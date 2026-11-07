import { describe, expect, test } from 'bun:test'
import { MAX_IMAGE_SIZE_BYTES } from '@/config/image-upload'
import type { UnsupportedImageFormat } from '../types'
import { validateImageFile, validateImageFormat, validateImageSize } from './validate-image-file'

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('validateImageFormat', () => {
  test('rejects a missing file', () => {
    expect(validateImageFormat(null)).toEqual([{ reason: 'NO_FILE' }, null])
    expect(validateImageFormat(undefined)).toEqual([{ reason: 'NO_FILE' }, null])
  })

  test('rejects an empty file', () => {
    const [err] = validateImageFormat(makeFile('a.png', 'image/png', 0))
    expect(err).toEqual({ reason: 'EMPTY_FILE' })
  })

  test.each([
    ['image/jpeg', 'photo.jpg'],
    ['image/png', 'shot.png'],
    ['image/webp', 'pic.webp'],
    ['image/gif', 'anim.gif'],
    ['image/svg+xml', 'logo.svg'],
  ])('accepts %s', (type, name) => {
    const [err, file] = validateImageFormat(makeFile(name, type))
    expect(err).toBeNull()
    expect(file?.name).toBe(name)
  })

  test('is case-insensitive for the declared MIME type', () => {
    const [err] = validateImageFormat(makeFile('a.jpg', 'IMAGE/JPEG'))
    expect(err).toBeNull()
  })

  test.each<[string, string, UnsupportedImageFormat]>([
    ['image/heic', 'IMG_1.heic', 'heic'],
    ['image/heif', 'IMG_2.heif', 'heif'],
    ['image/avif', 'pic.avif', 'avif'],
  ])('flags %s as UNSUPPORTED_FORMAT', (type, name, format) => {
    const [err] = validateImageFormat(makeFile(name, type))
    expect(err).toEqual({ reason: 'UNSUPPORTED_FORMAT', format })
  })

  test('detects HEIC by extension when the browser reports an empty type', () => {
    const [err] = validateImageFormat(makeFile('IMG_3.HEIC', ''))
    expect(err).toEqual({ reason: 'UNSUPPORTED_FORMAT', format: 'heic' })
  })

  test('trusts the declared type over a .heic extension (iOS converts to JPEG)', () => {
    const [err] = validateImageFormat(makeFile('IMG_4.heic', 'image/jpeg'))
    expect(err).toBeNull()
  })

  test('falls back to the extension when the type is empty or generic', () => {
    expect(validateImageFormat(makeFile('camera.jpg', ''))[0]).toBeNull()
    expect(validateImageFormat(makeFile('camera.png', 'application/octet-stream'))[0]).toBeNull()
  })

  test('rejects non-image files with the received type', () => {
    const [err] = validateImageFormat(makeFile('doc.pdf', 'application/pdf'))
    expect(err).toEqual({ reason: 'INVALID_FILE_TYPE', received: 'application/pdf' })
  })

  test('reports the extension (or "unknown") when no type is available', () => {
    expect(validateImageFormat(makeFile('notes.txt', ''))[0]).toEqual({
      reason: 'INVALID_FILE_TYPE',
      received: 'txt',
    })
    expect(validateImageFormat(makeFile('noextension', ''))[0]).toEqual({
      reason: 'INVALID_FILE_TYPE',
      received: 'unknown',
    })
  })
})

describe('validateImageSize', () => {
  test('accepts a file exactly at the limit', () => {
    const [err] = validateImageSize(makeFile('a.png', 'image/png', MAX_IMAGE_SIZE_BYTES))
    expect(err).toBeNull()
  })

  test('rejects a file above the limit with both sizes', () => {
    const size = MAX_IMAGE_SIZE_BYTES + 1
    const [err] = validateImageSize(makeFile('a.png', 'image/png', size))
    expect(err).toEqual({
      reason: 'FILE_TOO_LARGE',
      maxBytes: MAX_IMAGE_SIZE_BYTES,
      actualBytes: size,
    })
  })
})

describe('validateImageFile', () => {
  test('checks the format before the size', () => {
    const [err] = validateImageFile(makeFile('a.pdf', 'application/pdf', MAX_IMAGE_SIZE_BYTES + 1))
    expect(err?.reason).toBe('INVALID_FILE_TYPE')
  })

  test('returns the file when everything is valid', () => {
    const [err, file] = validateImageFile(makeFile('a.webp', 'image/webp'))
    expect(err).toBeNull()
    expect(file?.type).toBe('image/webp')
  })
})
