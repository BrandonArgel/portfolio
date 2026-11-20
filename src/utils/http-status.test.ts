import { describe, expect, test } from 'bun:test'
import { type ApiErrorReason, HTTP_STATUS_BY_REASON, handleApiError } from './http-status'

describe('handleApiError', () => {
  test('maps every ApiErrorReason in HTTP_STATUS_BY_REASON to its exact status', async () => {
    const reasons = Object.keys(HTTP_STATUS_BY_REASON) as ApiErrorReason[]
    expect(reasons.length).toBe(28)

    for (const reason of reasons) {
      const response = handleApiError({ reason })
      expect(response.status).toBe(HTTP_STATUS_BY_REASON[reason])
      expect(await response.json()).toEqual({ success: false, error: reason })
    }
  })

  test('maps conflict, permission, rate-limit, and upstream reasons accurately', () => {
    expect(handleApiError({ reason: 'DUPLICATE_POST_SLUG' }).status).toBe(409)
    expect(handleApiError({ reason: 'CANNOT_DEMOTE_SELF' }).status).toBe(403)
    expect(handleApiError({ reason: 'CANNOT_BAN_SELF' }).status).toBe(403)
    expect(handleApiError({ reason: 'RATE_LIMITED' }).status).toBe(429)
    expect(handleApiError({ reason: 'AI_TRANSLATION_FAILED' }).status).toBe(502)
    expect(handleApiError({ reason: 'DELIVERY_FAILED' }).status).toBe(502)
  })

  test('never leaks internal details in JSON responses', async () => {
    const response = handleApiError({
      reason: 'DATABASE_ERROR',
      details: new Error('SQLITE_BUSY: secret table info'),
    })

    expect(response.status).toBe(HTTP_STATUS_BY_REASON.DATABASE_ERROR)
    expect(await response.json()).toEqual({
      success: false,
      error: 'DATABASE_ERROR',
    })
  })
})
