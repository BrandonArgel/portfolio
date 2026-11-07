import { describe, expect, test } from 'bun:test'
import { MAX_IMAGE_SIZE_BYTES } from '@/config/image-upload'
import { prepareImageFile } from './prepare-image-file'

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type })
}

// `bun test` has no canvas / createImageBitmap, so these cover the paths that must not touch them.
describe('prepareImageFile (non-browser paths)', () => {
  test.each([
    ['anim.gif', 'image/gif'],
    ['logo.svg', 'image/svg+xml'],
  ])('never re-encodes %s (bypass rule)', async (name, type) => {
    const file = makeFile(name, type, 3 * 1024 * 1024)

    const [err, prepared] = await prepareImageFile(file)

    expect(err).toBeNull()
    expect(prepared).toBe(file)
  })

  test('returns the original when canvas APIs are unavailable', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 6 * 1024 * 1024)

    const [err, prepared] = await prepareImageFile(file)

    expect(err).toBeNull()
    expect(prepared).toBe(file)
  })

  test('returns the original for unknown types (validation happens elsewhere)', async () => {
    const file = makeFile('doc.pdf', 'application/pdf', MAX_IMAGE_SIZE_BYTES + 1)

    const [err, prepared] = await prepareImageFile(file)

    expect(err).toBeNull()
    expect(prepared).toBe(file)
  })
})
