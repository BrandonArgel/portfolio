import { describe, expect, spyOn, test } from 'bun:test'
import { error, okay } from '@/utils/result'
import { escapeLikePattern, withDatabaseError } from './utils'

describe('escapeLikePattern', () => {
  test('escapes SQLite LIKE wildcard and escape characters', () => {
    expect(escapeLikePattern('100%_test\\path')).toBe('100\\%\\_test\\\\path')
    expect(escapeLikePattern('normal query')).toBe('normal query')
  })
})

describe('withDatabaseError', () => {
  test('passes through okay and domain error tuples unchanged', async () => {
    const success = await withDatabaseError('Test query', async () => okay({ count: 3 }))
    expect(success).toEqual([null, { count: 3 }])

    const domainFailure = await withDatabaseError('Test query', async () =>
      error({ reason: 'POST_NOT_FOUND' }),
    )
    expect(domainFailure).toEqual([{ reason: 'POST_NOT_FOUND' }, null])
  })

  test('catches thrown database errors and returns DATABASE_ERROR with details', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    const dbFailure = new Error('SQLITE_BUSY')

    const result = await withDatabaseError('Error loading rows', async () => {
      throw dbFailure
    })

    expect(result).toEqual([{ reason: 'DATABASE_ERROR', details: dbFailure }, null])
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })
})
