import { describe, expect, test } from 'bun:test'
import { generateSlug } from './string-utils'

describe('generateSlug', () => {
  test('normalizes accents, punctuation, casing, and repeated whitespace', () => {
    expect(generateSlug('')).toBe('')
    expect(generateSlug('  Hola   Mundo en Next.js!  ')).toBe('hola-mundo-en-nextjs')
    expect(generateSlug('Guía de TypeScript & Zod 4')).toBe('guia-de-typescript-zod-4')
    expect(generateSlug('a---b   c')).toBe('a-b-c')
  })
})
