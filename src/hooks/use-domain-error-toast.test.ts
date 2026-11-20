import { describe, expect, test } from 'bun:test'
import { type ErrorTranslationFn, translateErrorReason } from './use-domain-error-toast'

type SampleError = { reason: 'NOT_FOUND' } | { reason: 'FORBIDDEN' }

describe('translateErrorReason', () => {
  test('maps domain error reason to translated title and description', () => {
    const messages: Record<
      `${SampleError['reason']}.title` | `${SampleError['reason']}.description`,
      string
    > = {
      'NOT_FOUND.title': 'Missing',
      'NOT_FOUND.description': 'Item does not exist',
      'FORBIDDEN.title': 'Denied',
      'FORBIDDEN.description': 'Permission required',
    }

    const t: ErrorTranslationFn<SampleError['reason']> = (key) => messages[key]

    expect(translateErrorReason(t, 'NOT_FOUND')).toEqual({
      title: 'Missing',
      description: 'Item does not exist',
    })
    expect(translateErrorReason(t, 'FORBIDDEN')).toEqual({
      title: 'Denied',
      description: 'Permission required',
    })
  })
})
