import { describe, expect, test } from 'bun:test'
import { rehypeCodeMeta } from './rehype-code-meta'

interface TestHastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  data?: Record<string, unknown>
  children?: TestHastNode[]
}

describe('rehypeCodeMeta', () => {
  test('forwards code.data.meta onto <pre data-meta="..."> and nested <code>', () => {
    const codeNode: TestHastNode = {
      type: 'element',
      tagName: 'code',
      properties: { className: ['language-tsx'] },
      data: { meta: 'title="example.tsx" highlight="2" add="4-5"' },
      children: [{ type: 'text', value: 'const x = 1' }],
    }
    const preNode: TestHastNode = {
      type: 'element',
      tagName: 'pre',
      properties: {},
      children: [codeNode],
    }
    const tree: TestHastNode = {
      type: 'root',
      children: [preNode],
    }

    rehypeCodeMeta()(tree)

    expect(preNode.properties).toEqual({
      'data-meta': 'title="example.tsx" highlight="2" add="4-5"',
    })
    expect(codeNode.properties).toEqual({
      className: ['language-tsx'],
      'data-meta': 'title="example.tsx" highlight="2" add="4-5"',
    })
  })

  test('ignores code blocks without metadata or blank meta strings', () => {
    const codeNode: TestHastNode = {
      type: 'element',
      tagName: 'code',
      properties: { className: ['language-ts'] },
      data: { meta: '   ' },
      children: [{ type: 'text', value: 'const a = 1' }],
    }
    const preNode: TestHastNode = {
      type: 'element',
      tagName: 'pre',
      properties: {},
      children: [codeNode],
    }

    rehypeCodeMeta()({ type: 'root', children: [preNode] })

    expect(preNode.properties).toEqual({})
    expect(codeNode.properties).toEqual({ className: ['language-ts'] })
  })
})
