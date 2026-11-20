import { describe, expect, test } from 'bun:test'
import { calculateReadTime } from './calculate-read-time'

describe('calculateReadTime', () => {
  test('returns at least 1 minute and scales by 200 words per minute', () => {
    expect(calculateReadTime('')).toBe(1)
    expect(calculateReadTime('hello world')).toBe(1)
    expect(calculateReadTime('word '.repeat(400))).toBe(2)
    expect(calculateReadTime('word '.repeat(401))).toBe(3)
  })
})
