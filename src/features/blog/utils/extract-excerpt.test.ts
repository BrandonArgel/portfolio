import { describe, expect, test } from 'bun:test'
import { extractExcerpt } from './extract-excerpt'

describe('extractExcerpt', () => {
  test('strips headings, links, images, and markdown emphasis delimiters', () => {
    const md =
      '# Heading\n\nRead [the docs](https://example.com) ![pic](a.png) with **bold** `code`.'
    expect(extractExcerpt(md)).toBe('Heading\n\nRead the docs  with bold code.')
  })

  test('truncates at maxLength with ellipsis', () => {
    const longText = 'word '.repeat(60)
    const excerpt = extractExcerpt(longText, 50)
    expect(excerpt.endsWith('...')).toBe(true)
    expect(excerpt.length).toBeLessThanOrEqual(53)
  })
})
