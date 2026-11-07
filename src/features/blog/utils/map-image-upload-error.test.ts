import { describe, expect, test } from 'bun:test'
import { mapActionFailure, mapThrownError } from './map-image-upload-error'

const online = { isOnline: true }

describe('mapThrownError', () => {
  test('reports OFFLINE before inspecting the error', () => {
    expect(mapThrownError(new TypeError('Failed to fetch'), { isOnline: false })).toEqual({
      reason: 'OFFLINE',
    })
  })

  test.each(['AbortError', 'TimeoutError'])('maps %s to TIMEOUT', (name) => {
    expect(mapThrownError(new DOMException('slow', name), online)).toEqual({ reason: 'TIMEOUT' })
  })

  test.each([
    ['Body exceeded 4.5 MB limit.'],
    ['Payload Too Large'],
    ['413 Request Entity Too Large'],
  ])('maps "%s" to PAYLOAD_TOO_LARGE', (message) => {
    expect(mapThrownError(new Error(message), online)).toEqual({ reason: 'PAYLOAD_TOO_LARGE' })
  })

  test('maps HTTP status codes', () => {
    expect(mapThrownError({ status: 413 }, online)).toEqual({ reason: 'PAYLOAD_TOO_LARGE' })
    expect(mapThrownError({ statusCode: 429 }, online)).toEqual({ reason: 'RATE_LIMITED' })
  })

  test.each([
    ['Failed to fetch'],
    ['Load failed'],
    ['NetworkError when attempting to fetch resource.'],
  ])('maps "%s" to NETWORK_ERROR', (message) => {
    expect(mapThrownError(new Error(message), online)).toEqual({ reason: 'NETWORK_ERROR' })
  })

  test('maps any TypeError (fetch rejection) to NETWORK_ERROR', () => {
    expect(mapThrownError(new TypeError('boom'), online)).toEqual({ reason: 'NETWORK_ERROR' })
  })

  test('falls back to UNKNOWN_ERROR', () => {
    expect(mapThrownError(new Error('something else'), online)).toEqual({
      reason: 'UNKNOWN_ERROR',
    })
    expect(mapThrownError(undefined, online)).toEqual({ reason: 'UNKNOWN_ERROR' })
    expect(mapThrownError(42, online)).toEqual({ reason: 'UNKNOWN_ERROR' })
  })
})

describe('mapActionFailure', () => {
  test('maps a missing session to UNAUTHORIZED', () => {
    expect(
      mapActionFailure({
        serverError: {
          title: 'SESSION_REVOKED',
          description: 'Your session is invalid or expired.',
        },
      }),
    ).toEqual({ reason: 'UNAUTHORIZED' })
  })

  test('maps a banned account to FORBIDDEN', () => {
    expect(
      mapActionFailure({
        serverError: { title: 'SESSION_REVOKED', description: 'Your account has been suspended.' },
      }),
    ).toEqual({ reason: 'FORBIDDEN' })
  })

  test('maps insufficient permissions to FORBIDDEN', () => {
    expect(mapActionFailure({ serverError: { title: 'Insufficient Permissions' } })).toEqual({
      reason: 'FORBIDDEN',
    })
  })

  test('maps unknown server errors and validation errors to UNKNOWN_ERROR', () => {
    expect(
      mapActionFailure({
        serverError: { title: 'Something went wrong while executing the operation.' },
      }),
    ).toEqual({ reason: 'UNKNOWN_ERROR' })
    expect(mapActionFailure({ validationErrors: { formErrors: ['bad'] } })).toEqual({
      reason: 'UNKNOWN_ERROR',
    })
  })
})
