import { describe, expect, mock, test } from 'bun:test'
import { z } from 'zod'
import type { RequiredRole, VerifiedActor, VerifyAccessError } from '@/lib/auth/verify-access'
import { error, okay, type Result } from '@/utils/result'
import { runAuthorizedAction } from './run-authorized-action'

const MOCK_ACTOR: VerifiedActor = {
  id: 'user-1',
  name: 'Brandon',
  image: null,
  role: 'admin',
}

const okAuth = async (_role: RequiredRole): Promise<Result<VerifiedActor, VerifyAccessError>> =>
  okay(MOCK_ACTOR)

const failAuth = async (_role: RequiredRole): Promise<Result<VerifiedActor, VerifyAccessError>> =>
  error({ reason: 'FORBIDDEN' })

const sampleSchema = z.object({
  title: z.string().trim().min(1),
})

describe('runAuthorizedAction', () => {
  test('propagates auth errors before schema parsing or handler execution', async () => {
    const handler = mock(async () => okay({ ok: true }))
    const onSuccess = mock(() => {})

    const res = await runAuthorizedAction({
      role: 'admin',
      schema: sampleSchema,
      input: { title: '' },
      verifyAccessFn: failAuth,
      handler,
      onSuccess,
    })

    expect(res).toEqual([{ reason: 'FORBIDDEN' }, null])
    expect(handler).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('returns default VALIDATION_ERROR on invalid schema input', async () => {
    const handler = mock(async () => okay({ ok: true }))

    const res = await runAuthorizedAction({
      role: 'editor',
      schema: sampleSchema,
      input: { title: '   ' },
      verifyAccessFn: okAuth,
      handler,
    })

    expect(res).toEqual([{ reason: 'VALIDATION_ERROR' }, null])
    expect(handler).not.toHaveBeenCalled()
  })

  test('supports custom mapValidationError mappers', async () => {
    const res = await runAuthorizedAction({
      role: 'editor',
      schema: sampleSchema,
      input: { title: '' },
      verifyAccessFn: okAuth,
      mapValidationError: (zodErr) => ({
        reason: 'VALIDATION_ERROR' as const,
        field: String(zodErr.issues[0]?.path[0] ?? ''),
      }),
      handler: async () => okay({ ok: true }),
    })

    expect(res).toEqual([{ reason: 'VALIDATION_ERROR', field: 'title' }, null])
  })

  test('propagates service errors without invoking onSuccess', async () => {
    const onSuccess = mock(() => {})

    const res = await runAuthorizedAction({
      role: 'user',
      schema: sampleSchema,
      input: { title: 'Hello' },
      verifyAccessFn: okAuth,
      handler: async (): Promise<Result<string, { reason: 'NOT_FOUND' }>> =>
        error({ reason: 'NOT_FOUND' }),
      onSuccess,
    })

    expect(res).toEqual([{ reason: 'NOT_FOUND' }, null])
    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('calls handler and onSuccess with parsed input and actor', async () => {
    const onSuccess = mock((result: { savedTitle: string }, data: { title: string }) => {
      expect(result.savedTitle).toBe('Clean Code')
      expect(data.title).toBe('Clean Code')
    })

    const res = await runAuthorizedAction({
      role: 'admin',
      schema: sampleSchema,
      input: { title: '  Clean Code  ' },
      verifyAccessFn: okAuth,
      handler: async (data, actor) => okay({ savedTitle: data.title, actorId: actor.id }),
      onSuccess,
    })

    expect(res).toEqual([null, { savedTitle: 'Clean Code', actorId: 'user-1' }])
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('supports parameterless actions without schema', async () => {
    const onSuccess = mock(() => {})

    const res = await runAuthorizedAction({
      role: 'editor',
      verifyAccessFn: okAuth,
      handler: async (actor) => okay({ actorId: actor.id }),
      onSuccess,
    })

    expect(res).toEqual([null, { actorId: 'user-1' }])
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
