import { afterEach, describe, expect, test } from 'bun:test'
import { Editor, type JSONContent } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'

import { preprocessMdxContent } from '@/features/blog/utils/preprocess-mdx'
import { type ChartConfig, DEFAULT_CHART_CONFIG, serializeChartToMdx } from '@/lib/chart-schema'
import { looksLikeMarkdown } from '@/lib/markdown-regex'
import { ChartNode } from './chart-node'
import { pastePlainText } from './headless-clipboard-test-utils'
import { MarkdownPaste } from './markdown-paste'

function createChartEditor(initialContent = ''): Editor {
  const hasContent = initialContent.length > 0
  const editor = new Editor({
    element: null,
    content: hasContent ? initialContent : { type: 'doc', content: [{ type: 'paragraph' }] },
    contentType: hasContent ? 'markdown' : undefined,
    extensions: [
      StarterKit,
      Markdown.configure({
        markedOptions: {
          gfm: true,
        },
      }),
      MarkdownPaste,
      ChartNode,
    ],
  })

  // `element: null` creates an initial EditorState without attaching ExtensionManager plugins.
  editor.view.updateState(editor.state.reconfigure({ plugins: editor.extensionManager.plugins }))
  return editor
}

const activeEditors: Editor[] = []
function track(editor: Editor): Editor {
  activeEditors.push(editor)
  return editor
}

afterEach(() => {
  while (activeEditors.length > 0) {
    activeEditors.pop()?.destroy()
  }
})

describe('ChartNode Markdown round-trips & MDX compatibility', () => {
  test.each(['bar', 'line', 'area', 'pie'] as const)(
    'round-trips %s chart node via MarkdownManager without losing config',
    (chartType) => {
      const config: ChartConfig = {
        ...DEFAULT_CHART_CONFIG,
        type: chartType,
        title: `Test ${chartType} chart's "Title"`,
        description: 'Revenue > Costs & C++ benchmark',
      }
      const mdx = serializeChartToMdx(config)

      const editor1 = track(createChartEditor(`# Heading\n\n${mdx}\n\nAfter chart.`))
      const json1 = editor1.getJSON()
      const chartNodes = (json1.content ?? []).filter((node: JSONContent) => node.type === 'chart')
      expect(chartNodes).toHaveLength(1)
      expect(chartNodes[0]?.attrs?.type).toBe(chartType)
      expect(chartNodes[0]?.attrs?.title).toBe(config.title)
      expect(chartNodes[0]?.attrs?.description).toBe(config.description)

      const serializedAgain = editor1.getMarkdown()
      const editor2 = track(createChartEditor(serializedAgain))
      expect(editor2.getJSON()).toEqual(json1)
    },
  )

  test('detects and pastes <Chart ... /> MDX markup via MarkdownPaste', () => {
    const mdx = serializeChartToMdx({
      ...DEFAULT_CHART_CONFIG,
      type: 'pie',
      title: 'Market Share',
    })

    expect(looksLikeMarkdown(mdx)).toBe(true)

    const editor = track(createChartEditor())
    expect(pastePlainText(editor, mdx)).toBe(true)
    const chartNode = editor.getJSON().content?.find((n: JSONContent) => n.type === 'chart')
    expect(chartNode?.attrs?.type).toBe('pie')
    expect(chartNode?.attrs?.title).toBe('Market Share')
  })

  test('preprocessMdxContent preserves <Chart ... /> verbatim while transforming prose around it', () => {
    const chartMdx = serializeChartToMdx({
      ...DEFAULT_CHART_CONFIG,
      title: 'C++ & ==Literal== Benchmark',
    })
    const fullPost = `Some ==highlighted== and ++underlined++ intro.\n\n${chartMdx}\n\nClosing ==note==.`
    const output = preprocessMdxContent(fullPost)

    expect(output).toContain(chartMdx)
    expect(output).toContain(
      'Some <MdxMark>highlighted</MdxMark> and <MdxU>underlined</MdxU> intro.',
    )
    expect(output).toContain('Closing <MdxMark>note</MdxMark>.')
  })
})
