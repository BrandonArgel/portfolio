import { describe, expect, test } from 'bun:test'
import {
  assertNever,
  error,
  fromPromise,
  isErrorResult,
  okay,
  type Result,
  tryCatchResult,
} from './result'

describe('result utilities', () => {
  test('okay wraps data in a success tuple', () => {
    expect(okay({ id: '123' })).toEqual([null, { id: '123' }])
  })

  test('error wraps error object in a failure tuple', () => {
    expect(error({ reason: 'NOT_FOUND' })).toEqual([{ reason: 'NOT_FOUND' }, null])
  })

  test('isErrorResult narrows failure and success tuples', () => {
    const errTuple: Result<string, { reason: 'NOT_FOUND' }> = error({ reason: 'NOT_FOUND' })
    const okTuple: Result<string, { reason: 'NOT_FOUND' }> = okay('hello')

    expect(isErrorResult(errTuple)).toBe(true)
    expect(isErrorResult(okTuple)).toBe(false)
  })

  test('assertNever throws a descriptive error when reached at runtime', () => {
    const unexpected = { reason: 'UNEXPECTED' } as never
    expect(() => assertNever(unexpected)).toThrow('Unhandled discriminated union member')
  })

  test('tryCatchResult forwards ok results, domain errors, and maps thrown exceptions', async () => {
    type DomainErr = { reason: 'DOMAIN_FAIL' }
    type CatchErr = { reason: 'UNKNOWN_ERROR'; details: unknown }

    const okRes = await tryCatchResult<string, DomainErr, CatchErr>(
      async () => okay('done'),
      (thrown) => ({ reason: 'UNKNOWN_ERROR', details: thrown }),
    )
    expect(okRes).toEqual([null, 'done'])

    const domainRes = await tryCatchResult<string, DomainErr, CatchErr>(
      async () => error({ reason: 'DOMAIN_FAIL' }),
      (thrown) => ({ reason: 'UNKNOWN_ERROR', details: thrown }),
    )
    expect(domainRes).toEqual([{ reason: 'DOMAIN_FAIL' }, null])

    const boom = new Error('boom')
    const caughtRes = await tryCatchResult<string, DomainErr, CatchErr>(
      async () => {
        throw boom
      },
      (thrown) => ({ reason: 'UNKNOWN_ERROR', details: thrown }),
    )
    expect(caughtRes).toEqual([{ reason: 'UNKNOWN_ERROR', details: boom }, null])
  })

  test('fromPromise resolves values into okay and rejected promises into error', async () => {
    const okRes: Result<number, { reason: 'FAILED' }> = await fromPromise(
      async () => 42,
      () => ({ reason: 'FAILED' }),
    )
    expect(okRes).toEqual([null, 42])

    const failRes: Result<number, { reason: 'FAILED'; msg: string }> = await fromPromise(
      async () => {
        throw new Error('network down')
      },
      (thrown) => ({
        reason: 'FAILED',
        msg: thrown instanceof Error ? thrown.message : 'unknown',
      }),
    )
    expect(failRes).toEqual([{ reason: 'FAILED', msg: 'network down' }, null])
  })
})
