import { describe, expect, test } from 'bun:test'
import { getInitials } from './get-initials'

describe('getInitials', () => {
  test('extracts up to two uppercase initials and falls back cleanly', () => {
    expect(getInitials('Brandon Argel')).toBe('BA')
    expect(getInitials('Brandon Argel Verdeja')).toBe('BA')
    expect(getInitials('  single  ')).toBe('S')
    expect(getInitials('')).toBe('U')
    expect(getInitials(null, '?')).toBe('?')
  })
})
