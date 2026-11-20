import { describe, expect, test } from 'bun:test'
import { preprocessMdxContent } from './preprocess-mdx'

describe('preprocessMdxContent', () => {
  test('returns empty string for empty input', () => {
    expect(preprocessMdxContent('')).toBe('')
  })

  test('transforms YouTube directives, highlights, underlines, and colored marks', () => {
    const input = [
      ':::youtube{id="abc123"}:::',
      'Text with ==highlighted== and ++underlined++ plus <u>tag</u>.',
      '<mark style="background-color: #fef08a">Yellow mark</mark>',
      '<span data-color="blue">Blue text</span>',
    ].join('\n\n')

    const output = preprocessMdxContent(input)

    expect(output).toContain('<YouTube id="abc123" />')
    expect(output).toContain('<MdxMark>highlighted</MdxMark>')
    expect(output).toContain('<MdxU>underlined</MdxU>')
    expect(output).toContain('<MdxU>tag</MdxU>')
    expect(output).toContain('<MdxMark')
    expect(output).toContain('<MdxSpan')
    expect(output).not.toContain('<mark')
    expect(output).not.toContain('<span')
  })

  test('prefixes lines starting directly with inline MDX mark/underline tags', () => {
    const output = preprocessMdxContent('==leading highlight==')
    expect(output.startsWith('\u200B<MdxMark>')).toBe(true)
  })

  test('preserves fenced code blocks and inline code spans untouched', () => {
    const input = [
      'Use `==not highlight==` and `:::youtube{id="x"}:::` inline.',
      '',
      '```tsx',
      'const html = "<mark>leave me alone</mark> ++not-u++" ',
      '```',
    ].join('\n')

    const output = preprocessMdxContent(input)

    expect(output).toContain('`==not highlight==`')
    expect(output).toContain('`:::youtube{id="x"}:::`')
    expect(output).toContain('<mark>leave me alone</mark> ++not-u++')
  })

  test('preserves <Checklist> blocks and transforms inline marks inside task items without escaping', () => {
    const input = [
      '<Checklist>',
      '',
      '- [ ] Verify **bold**, `inline <Checklist>` and ==important== items',
      '- [x] Confirm step works cleanly',
      '',
      '</Checklist>',
      '',
      '<Checklist disabled>',
      '- [x] Read-only item',
      '</Checklist>',
    ].join('\n')

    const output = preprocessMdxContent(input)

    expect(output).toContain('<Checklist>')
    expect(output).toContain('</Checklist>')
    expect(output).toContain('<Checklist disabled>')
    expect(output).not.toContain('&lt;Checklist')
    expect(output).toContain(
      '- [ ] Verify **bold**, `inline <Checklist>` and <MdxMark>important</MdxMark> items',
    )
    expect(output).toContain('- [x] Read-only item')
  })
})
