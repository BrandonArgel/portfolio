import { describe, expect, test } from 'bun:test'
import {
  CALLOUT_ALERT_INPUT_RULE,
  CALLOUT_BLOCK,
  CALLOUT_DIRECTIVE_INPUT_RULE,
  CALLOUT_HEADER,
  CALLOUT_MARKER_STRIP,
  CALLOUT_TYPES,
  CODE_FENCE_INPUT_RULE,
  DEFAULT_CALLOUT_TYPE,
  getCalloutLabel,
  HIGHLIGHT_TOKEN,
  IMAGE_INPUT_RULE,
  isCalloutType,
  looksLikeMarkdown,
  normalizeCalloutType,
  TASK_ITEM_INPUT_RULE,
  UNDERLINE_INPUT_RULE,
  UNDERLINE_PASTE_RULE,
} from './markdown-regex'

describe('markdown-regex callout helpers', () => {
  test('includes note alongside all 11 supported callout types and validates cleanly', () => {
    expect(CALLOUT_TYPES).toContain('note')
    expect(CALLOUT_TYPES).toHaveLength(11)

    for (const calloutType of CALLOUT_TYPES) {
      expect(isCalloutType(calloutType)).toBe(true)
      expect(normalizeCalloutType(calloutType)).toBe(calloutType)
    }

    expect(isCalloutType('unknown')).toBe(false)
    expect(isCalloutType(null)).toBe(false)
    expect(normalizeCalloutType('invalid')).toBe(DEFAULT_CALLOUT_TYPE)
    expect(getCalloutLabel('note')).toBe('Note')
    expect(getCalloutLabel('tip')).toBe('Tip')
  })
})

describe('markdown-regex input, block, and inline patterns', () => {
  test('TASK_ITEM_INPUT_RULE matches shorthand, empty, checked, and bullet-prefixed syntaxes', () => {
    expect(TASK_ITEM_INPUT_RULE.exec('[] ')?.[1]).toBe('')
    expect(TASK_ITEM_INPUT_RULE.exec('[ ] ')?.[1]).toBe(' ')
    expect(TASK_ITEM_INPUT_RULE.exec('[x] ')?.[1]).toBe('x')
    expect(TASK_ITEM_INPUT_RULE.exec('[X] ')?.[1]).toBe('X')
    expect(TASK_ITEM_INPUT_RULE.exec('- [] ')?.[1]).toBe('')
    expect(TASK_ITEM_INPUT_RULE.exec('* [ ] ')?.[1]).toBe(' ')
    expect(TASK_ITEM_INPUT_RULE.exec('+ [x] ')?.[1]).toBe('x')
    expect(TASK_ITEM_INPUT_RULE.exec('  - [X] ')?.[1]).toBe('X')
    expect(TASK_ITEM_INPUT_RULE.exec('[bad] ')).toBeNull()
  })

  test('callout input and block patterns parse alert and directive syntaxes', () => {
    expect(CALLOUT_ALERT_INPUT_RULE.exec('> [!NOTE] ')?.[1]).toBe('NOTE')
    expect(CALLOUT_ALERT_INPUT_RULE.exec('[!tip] ')?.[1]).toBe('tip')
    expect(CALLOUT_DIRECTIVE_INPUT_RULE.exec(':::warning ')?.[1]).toBe('warning')

    const headerMatch = CALLOUT_HEADER.exec('  [!TIP] Useful Hint')
    expect(headerMatch?.[1]).toBe('TIP')
    expect(headerMatch?.[2]).toBe('Useful Hint')

    expect('[!NOTE] Custom Title\nBody'.replace(CALLOUT_MARKER_STRIP, '')).toBe('Body')

    const blockMatch = CALLOUT_BLOCK.exec('> [!NOTE]\n> Body line\n\nAfter')
    expect(blockMatch?.[1]).toBe('NOTE')
    expect(blockMatch?.[2]).toBe('')
    expect(blockMatch?.[3]).toBe('> Body line\n')
  })

  test('CODE_FENCE_INPUT_RULE matches uppercase, digits, and symbol languages', () => {
    expect(CODE_FENCE_INPUT_RULE.exec('```ts ')?.[1]).toBe('ts')
    expect(CODE_FENCE_INPUT_RULE.exec('```TS ')?.[1]).toBe('TS')
    expect(CODE_FENCE_INPUT_RULE.exec('```c++ ')?.[1]).toBe('c++')
    expect(CODE_FENCE_INPUT_RULE.exec('~~~json5\n')?.[1]).toBe('json5')
    expect(CODE_FENCE_INPUT_RULE.exec('``` ')?.[1]).toBeUndefined()
  })

  test('IMAGE_INPUT_RULE matches alt with spaces, empty alt, and quoted titles with spaces', () => {
    const withTitle = IMAGE_INPUT_RULE.exec(
      'see ![Alt text](https://example.com/a.png "Nice Title")',
    )
    expect(withTitle?.[1]).toBe('![Alt text](https://example.com/a.png "Nice Title")')
    expect(withTitle?.[2]).toBe('Alt text')
    expect(withTitle?.[3]).toBe('https://example.com/a.png')
    expect(withTitle?.[4]).toBe('Nice Title')

    const emptyAlt = IMAGE_INPUT_RULE.exec('![](https://example.com/pic.webp)')
    expect(emptyAlt?.[2]).toBe('')
    expect(emptyAlt?.[3]).toBe('https://example.com/pic.webp')
    expect(emptyAlt?.[4]).toBeUndefined()
  })

  test('highlight and underline inline rules match delimiting syntax cleanly', () => {
    expect(HIGHLIGHT_TOKEN.exec('==important== text')?.[2]).toBe('important')
    expect(HIGHLIGHT_TOKEN.exec('===heading===')).toBeNull()

    expect(UNDERLINE_INPUT_RULE.exec('++underlined++')?.[2]).toBe('underlined')
    expect(UNDERLINE_INPUT_RULE.exec('text ++multi word++')?.[2]).toBe('multi word')
    expect('a ++one++ and ++two++'.match(UNDERLINE_PASTE_RULE)).toEqual([' ++one++', ' ++two++'])
  })
})

describe('looksLikeMarkdown', () => {
  test('returns true for common block and inline Markdown/MDX constructs', () => {
    expect(looksLikeMarkdown('# Heading')).toBe(true)
    expect(looksLikeMarkdown('- [ ] Task item')).toBe(true)
    expect(looksLikeMarkdown('<Checklist>\n- [ ] Step\n</Checklist>')).toBe(true)
    expect(looksLikeMarkdown('> [!NOTE] Heads up\n> Body')).toBe(true)
    expect(looksLikeMarkdown('```ts title="app.ts"\nconst x = 1\n```')).toBe(true)
    expect(looksLikeMarkdown('| Col A | Col B |\n| --- | --- |\n| 1 | 2 |')).toBe(true)
    expect(looksLikeMarkdown('---')).toBe(true)
    expect(looksLikeMarkdown('$$\nx^2 + y^2 = z^2\n$$')).toBe(true)
    expect(looksLikeMarkdown(':::youtube{id="dQw4w9WgXcQ"}:::')).toBe(true)
    expect(looksLikeMarkdown('Some **bold** text')).toBe(true)
    expect(looksLikeMarkdown('Some ==highlighted== text')).toBe(true)
    expect(looksLikeMarkdown('Some ++underlined++ text')).toBe(true)
    expect(looksLikeMarkdown('![alt](https://example.com/a.png)')).toBe(true)
    expect(looksLikeMarkdown('Check [docs](https://example.com)')).toBe(true)
  })

  test('returns false for empty input, plain prose, and bare YouTube URLs', () => {
    expect(looksLikeMarkdown('')).toBe(false)
    expect(looksLikeMarkdown('   \n  ')).toBe(false)
    expect(looksLikeMarkdown('Just an ordinary plain text sentence.')).toBe(false)
    expect(looksLikeMarkdown('Issue #123 costs $50 today.')).toBe(false)
    expect(looksLikeMarkdown('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false)
    expect(looksLikeMarkdown('https://youtu.be/dQw4w9WgXcQ')).toBe(false)
  })
})
