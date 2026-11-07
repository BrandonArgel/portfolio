import { describe, expect, mock, test } from 'bun:test'
import { MAX_IMAGE_SIZE_BYTES } from '@/config/image-upload'
import { error, okay, type Result } from '@/utils/result'
import type { ImageUploadError, UploadTransport } from '../types'
import { uploadImageService } from './image-upload-service'

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

const okTransport: UploadTransport = async () => ({
  data: okay({ url: 'https://blob.example/photo.jpg' }),
})

const passthroughPrepare = async (file: File): Promise<Result<File, ImageUploadError>> => okay(file)

describe('uploadImageService', () => {
  test('uploads a valid image and returns its URL', async () => {
    const transport = mock(okTransport)

    const result = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport,
      prepare: passthroughPrepare,
    })

    expect(result).toEqual([null, 'https://blob.example/photo.jpg'])
    expect(transport).toHaveBeenCalledTimes(1)

    const firstCall = transport.mock.calls[0]
    expect(firstCall).toBeDefined()
    const formData = firstCall ? (firstCall[0] as FormData) : null
    const sent = formData?.get('file')
    expect(sent).toBeInstanceOf(File)
  })

  test('fails fast on format errors without compressing or sending', async () => {
    const transport = mock(okTransport)
    const prepare = mock(passthroughPrepare)

    const [err] = await uploadImageService(makeFile('a.pdf', 'application/pdf'), {
      transport,
      prepare,
    })

    expect(err?.reason).toBe('INVALID_FILE_TYPE')
    expect(prepare).not.toHaveBeenCalled()
    expect(transport).not.toHaveBeenCalled()
  })

  test('reports NO_FILE and EMPTY_FILE', async () => {
    const deps = { transport: okTransport, prepare: passthroughPrepare }

    expect((await uploadImageService(null, deps))[0]).toEqual({ reason: 'NO_FILE' })
    expect((await uploadImageService(makeFile('a.png', 'image/png', 0), deps))[0]).toEqual({
      reason: 'EMPTY_FILE',
    })
  })

  test('checks the size AFTER compression (big photo that shrinks succeeds)', async () => {
    const bigPhoto = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)
    const compressed = makeFile('big.jpg', 'image/jpeg', 400 * 1024)
    const prepare = mock(async () => okay(compressed))

    const result = await uploadImageService(bigPhoto, { transport: okTransport, prepare })

    expect(prepare).toHaveBeenCalledTimes(1)
    expect(result[0]).toBeNull()
  })

  test('rejects with FILE_TOO_LARGE when compression is not enough', async () => {
    const transport = mock(okTransport)
    const huge = makeFile('huge.gif', 'image/gif', MAX_IMAGE_SIZE_BYTES + 1)

    const [err] = await uploadImageService(huge, { transport, prepare: passthroughPrepare })

    expect(err).toEqual({
      reason: 'FILE_TOO_LARGE',
      maxBytes: MAX_IMAGE_SIZE_BYTES,
      actualBytes: MAX_IMAGE_SIZE_BYTES + 1,
    })
    expect(transport).not.toHaveBeenCalled()
  })

  test('propagates IMAGE_PROCESSING_FAILED from the prepare step', async () => {
    const [err] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport: okTransport,
      prepare: async () => error({ reason: 'IMAGE_PROCESSING_FAILED' }),
    })

    expect(err).toEqual({ reason: 'IMAGE_PROCESSING_FAILED' })
  })

  test('reports OFFLINE without sending when the browser is offline', async () => {
    const transport = mock(okTransport)

    const [err] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport,
      prepare: passthroughPrepare,
      isOnline: () => false,
    })

    expect(err).toEqual({ reason: 'OFFLINE' })
    expect(transport).not.toHaveBeenCalled()
  })

  test('returns errors reported by the server action as values', async () => {
    const [err] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport: async () => ({ data: error({ reason: 'STORAGE_ERROR' }) }),
      prepare: passthroughPrepare,
    })

    expect(err).toEqual({ reason: 'STORAGE_ERROR' })
  })

  test('maps auth failures raised by the action middleware', async () => {
    const [unauthorized] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport: async () => ({
        serverError: {
          title: 'SESSION_REVOKED',
          description: 'Your session is invalid or expired.',
        },
      }),
      prepare: passthroughPrepare,
    })
    const [forbidden] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport: async () => ({
        serverError: { title: 'SESSION_REVOKED', description: 'Your account has been suspended.' },
      }),
      prepare: passthroughPrepare,
    })

    expect(unauthorized).toEqual({ reason: 'UNAUTHORIZED' })
    expect(forbidden).toEqual({ reason: 'FORBIDDEN' })
  })

  test('maps thrown transport errors', async () => {
    const run = (thrown: unknown) =>
      uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
        transport: async () => {
          throw thrown
        },
        prepare: passthroughPrepare,
      })

    expect((await run(new TypeError('Failed to fetch')))[0]).toEqual({ reason: 'NETWORK_ERROR' })
    expect((await run(new Error('Body exceeded 4.5 MB limit.')))[0]).toEqual({
      reason: 'PAYLOAD_TOO_LARGE',
    })
  })

  test('reports TIMEOUT when the server never answers', async () => {
    const [err] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport: () => new Promise(() => {}),
      prepare: passthroughPrepare,
      timeoutMs: 20,
    })

    expect(err).toEqual({ reason: 'TIMEOUT' })
  })

  test('reports UNKNOWN_ERROR for an empty response', async () => {
    const [err] = await uploadImageService(makeFile('a.jpg', 'image/jpeg'), {
      transport: async () => undefined,
      prepare: passthroughPrepare,
    })

    expect(err).toEqual({ reason: 'UNKNOWN_ERROR' })
  })
})
