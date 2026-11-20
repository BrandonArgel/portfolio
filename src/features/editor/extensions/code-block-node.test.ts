import { describe, expect, test } from 'bun:test'
import { MarkdownManager } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { highlighter } from '@/lib/highlighter'
import { CodeBlockNode } from './code-block-node'

function createMarkdownManager() {
  return new MarkdownManager({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockNode.configure({
        highlighter,
        defaultLanguage: 'plaintext',
      }),
    ],
    markedOptions: { gfm: true },
  })
}

describe('CodeBlockNode markdown round-trip', () => {
  test('parses and serializes plain and language-only fenced blocks cleanly', () => {
    const mm = createMarkdownManager()
    const input = '```ts\nconst answer = 42\n```'

    const doc = mm.parse(input)
    const node = doc.content?.[0]

    expect(node?.type).toBe('codeBlock')
    expect(node?.attrs).toEqual({
      language: 'ts',
      title: '',
      highlight: '',
      add: '',
      remove: '',
      startLine: 1,
      lineNumbers: true,
    })
    expect(mm.serialize(doc)).toBe(input)
  })

  test('round-trips rich fence metadata (title, highlight, add, remove, startLine, lineNumbers)', () => {
    const mm = createMarkdownManager()
    const input = [
      '```tsx title="example.tsx" highlight="5" add="7-10" remove="3" startLine="12" lineNumbers="false"',
      'export function Demo() {',
      '  return <div />',
      '}',
      '```',
    ].join('\n')

    const doc = mm.parse(input)
    const node = doc.content?.[0]

    expect(node?.type).toBe('codeBlock')
    expect(node?.attrs).toEqual({
      language: 'tsx',
      title: 'example.tsx',
      highlight: '5',
      add: '7-10',
      remove: '3',
      startLine: 12,
      lineNumbers: false,
    })

    expect(mm.serialize(doc)).toBe(input)
  })

  test('parses shorthand highlight/diff aliases and normalizes on serialization', () => {
    const mm = createMarkdownManager()
    const input = ['```ts filename="api.ts" {2, 4-5} ins={7-8} del={1}', 'const a = 1', '```'].join(
      '\n',
    )

    const doc = mm.parse(input)
    expect(doc.content?.[0]?.attrs).toEqual({
      language: 'ts',
      title: 'api.ts',
      highlight: '2,4-5',
      add: '7-8',
      remove: '1',
      startLine: 1,
      lineNumbers: true,
    })

    expect(mm.serialize(doc)).toBe(
      ['```ts title="api.ts" highlight="2,4-5" add="7-8" remove="1"', 'const a = 1', '```'].join(
        '\n',
      ),
    )
  })
})
