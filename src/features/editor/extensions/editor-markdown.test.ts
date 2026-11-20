import { afterEach, describe, expect, test } from 'bun:test'
import { Editor, type JSONContent } from '@tiptap/core'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Youtube from '@tiptap/extension-youtube'
import { Markdown } from '@tiptap/markdown'
import { Fragment, Slice } from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'

import { highlighter } from '@/lib/highlighter'
import { CalloutNode } from './callout-node'
import { CalloutTitleNode } from './callout-title-node'
import { CodeBlockNode } from './code-block-node'
import { HeadlessClipboardEvent, pastePlainText } from './headless-clipboard-test-utils'
import { HighlightMark } from './highlight-mark'
import { ImageNode } from './image-node'
import { MarkdownPaste } from './markdown-paste'
import { TaskItemNode } from './task-item-node'
import { TaskListNode } from './task-list-node'
import { ColorExtension, TextStyleMark } from './text-style-mark'
import { UnderlineMark } from './underline-mark'

function createHeadlessEditor(initialContent = ''): Editor {
  const hasMarkdownContent = initialContent.length > 0
  const editor = new Editor({
    element: null,
    content: hasMarkdownContent
      ? initialContent
      : { type: 'doc', content: [{ type: 'paragraph' }] },
    contentType: hasMarkdownContent ? 'markdown' : undefined,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        underline: false,
      }),
      UnderlineMark,
      TextStyleMark,
      ColorExtension,
      HighlightMark.configure({ multicolor: true }),
      CodeBlockNode.configure({
        highlighter,
        defaultLanguage: 'plaintext',
      }),
      CalloutNode,
      CalloutTitleNode,
      ImageNode,
      Markdown.configure({
        markedOptions: {
          gfm: true,
        },
      }),
      TaskListNode,
      TaskItemNode.configure({ nested: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ inline: false, nocookie: true, modestBranding: true }),
      Mathematics.configure({ katexOptions: { throwOnError: false } }),
      MarkdownPaste,
    ],
  })

  // `element: null` creates an initial EditorState without attaching ExtensionManager plugins.
  editor.view.updateState(editor.state.reconfigure({ plugins: editor.extensionManager.plugins }))
  return editor
}

function getDocContent(editor: Editor): JSONContent[] {
  const doc: JSONContent = editor.getJSON()
  return doc.content ?? []
}

function getDocNodes(editor: Editor): JSONContent[] {
  const nodes = getDocContent(editor)
  const lastNode = nodes.at(-1)
  if (
    nodes.length > 1 &&
    lastNode?.type === 'paragraph' &&
    (!lastNode.content || lastNode.content.length === 0)
  ) {
    return nodes.slice(0, -1)
  }
  return nodes
}

function typeText(editor: Editor, input: string): void {
  for (const ch of input) {
    if (ch === '\n') {
      const splitHandled =
        editor.commands.splitListItem('listItem') || editor.commands.splitListItem('taskItem')
      if (!splitHandled) {
        editor.commands.splitBlock()
      }
      continue
    }

    const { from, to } = editor.state.selection
    let handled = false

    for (const plugin of editor.state.plugins) {
      const handleTextInput = plugin.props.handleTextInput
      if (
        handleTextInput?.call(plugin, editor.view, from, to, ch, () =>
          editor.state.tr.insertText(ch, from, to),
        )
      ) {
        handled = true
        break
      }
    }

    if (!handled) {
      editor.view.dispatch(editor.state.tr.insertText(ch, from, to))
    }
  }
}

function getMarkdownPastePlugin(editor: Editor) {
  return editor.state.plugins.find(
    (plugin) =>
      'key' in plugin && typeof plugin.key === 'string' && plugin.key.startsWith('markdownPaste'),
  )
}

const activeEditors: Editor[] = []

function setupEditor(initialContent = ''): Editor {
  const editor = createHeadlessEditor(initialContent)
  activeEditors.push(editor)
  return editor
}

afterEach(() => {
  while (activeEditors.length > 0) {
    activeEditors.pop()?.destroy()
  }
})

describe('Tiptap live typing InputRules', () => {
  test('converts - []  and - [ ]  from bullet list into unchecked taskList/taskItem without literal brackets', () => {
    const emptyBracketEditor = setupEditor()
    typeText(emptyBracketEditor, '- [] First shorthand task')

    expect(getDocNodes(emptyBracketEditor)).toEqual([
      {
        type: 'taskList',
        attrs: { interactive: false },
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'First shorthand task' }] },
            ],
          },
        ],
      },
    ])
    expect(emptyBracketEditor.getMarkdown().trimEnd()).toBe('- [ ] First shorthand task')

    const spacedBracketEditor = setupEditor()
    typeText(spacedBracketEditor, '- [ ] Standard task')
    expect(spacedBracketEditor.getMarkdown().trimEnd()).toBe('- [ ] Standard task')
  })

  test('converts - [x] , - [X] , and standalone []  / [ ]  into task items with right checked state', () => {
    const lowerXEditor = setupEditor()
    typeText(lowerXEditor, '- [x] Done lowercase')
    expect(getDocNodes(lowerXEditor)[0]?.content?.[0]?.attrs?.checked).toBe(true)
    expect(lowerXEditor.getMarkdown().trimEnd()).toBe('- [x] Done lowercase')

    const upperXEditor = setupEditor()
    typeText(upperXEditor, '- [X] Done uppercase')
    expect(getDocNodes(upperXEditor)[0]?.content?.[0]?.attrs?.checked).toBe(true)

    const standaloneShorthandEditor = setupEditor()
    typeText(standaloneShorthandEditor, '[] Standalone empty')
    expect(getDocNodes(standaloneShorthandEditor)[0]?.type).toBe('taskList')
    expect(standaloneShorthandEditor.getMarkdown().trimEnd()).toBe('- [ ] Standalone empty')

    const standaloneSpaceEditor = setupEditor()
    typeText(standaloneSpaceEditor, '[ ] Standalone spaced')
    expect(getDocNodes(standaloneSpaceEditor)[0]?.type).toBe('taskList')
    expect(standaloneSpaceEditor.getMarkdown().trimEnd()).toBe('- [ ] Standalone spaced')
  })

  test('splits a multi-item bulletList cleanly when converting the middle or second item into a task item', () => {
    const editor = setupEditor()
    typeText(editor, '- Keep bullet\n[] Convert item')

    const topTypes = getDocNodes(editor).map((node) => node.type)
    expect(topTypes).toEqual(['bulletList', 'taskList'])
    expect(editor.getMarkdown().trimEnd()).toBe('- Keep bullet\n\n- [ ] Convert item')
  })

  test('converts > [!NOTE] , > [!TIP] , and :::warning  into CalloutNode and places cursor in body paragraph', () => {
    const noteEditor = setupEditor()
    typeText(noteEditor, '> [!NOTE] Body typed right after shortcut')

    expect(getDocNodes(noteEditor)).toEqual([
      {
        type: 'callout',
        attrs: { type: 'note' },
        content: [
          { type: 'calloutTitle', content: [{ type: 'text', text: 'Note' }] },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Body typed right after shortcut' }],
          },
        ],
      },
    ])
    expect(noteEditor.getMarkdown().trimEnd()).toBe(
      '> [!NOTE] Note\n> Body typed right after shortcut',
    )

    const tipEditor = setupEditor()
    typeText(tipEditor, '> [!TIP] Pro tip body')
    expect(getDocNodes(tipEditor)[0]?.attrs?.type).toBe('tip')

    const directiveEditor = setupEditor()
    typeText(directiveEditor, ':::warning Watch out')
    expect(getDocNodes(directiveEditor)[0]).toEqual({
      type: 'callout',
      attrs: { type: 'warning' },
      content: [
        { type: 'calloutTitle', content: [{ type: 'text', text: 'Warning' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Watch out' }] },
      ],
    })
  })

  test('does not convert plain [!NOTE]  outside a blockquote', () => {
    const editor = setupEditor()
    typeText(editor, '[!NOTE] Plain text')

    expect(getDocNodes(editor)[0]?.type).toBe('paragraph')
    expect(editor.getText()).toBe('[!NOTE] Plain text')
  })

  test('triggers horizontal rule, code blocks (with special langs & blank default), highlight, underline, and image shortcuts', () => {
    const hrEditor = setupEditor()
    typeText(hrEditor, '---')
    expect(getDocNodes(hrEditor)[0]?.type).toBe('horizontalRule')

    const tsCodeEditor = setupEditor()
    typeText(tsCodeEditor, '```TS const a = 1')
    expect(getDocNodes(tsCodeEditor)[0]?.type).toBe('codeBlock')
    expect(getDocNodes(tsCodeEditor)[0]?.attrs?.language).toBe('ts')

    const cppCodeEditor = setupEditor()
    typeText(cppCodeEditor, '```c++ int x = 0;')
    expect(getDocNodes(cppCodeEditor)[0]?.type).toBe('codeBlock')
    expect(getDocNodes(cppCodeEditor)[0]?.attrs?.language).toBe('c++')

    const plainCodeEditor = setupEditor()
    typeText(plainCodeEditor, '``` hello')
    expect(getDocNodes(plainCodeEditor)[0]?.type).toBe('codeBlock')
    expect(getDocNodes(plainCodeEditor)[0]?.attrs?.language).toBeNull()

    const marksEditor = setupEditor()
    typeText(marksEditor, '==highlighted== and ++underlined++')
    expect(marksEditor.getMarkdown()).toBe('==highlighted== and ++underlined++')

    const imageEditor = setupEditor()
    typeText(imageEditor, '![Alt text](https://example.com/a.png "Nice Title")')
    expect(getDocNodes(imageEditor)[0]).toEqual({
      type: 'image',
      attrs: {
        src: 'https://example.com/a.png',
        alt: 'Alt text',
        title: 'Nice Title',
        width: null,
        height: null,
        isUploading: false,
        uploadId: null,
      },
    })
  })
})

describe('MarkdownPaste plain-text clipboard handling', () => {
  test('parses pasted task lists, <Checklist>, > [!NOTE] callouts, and rich code blocks', () => {
    const taskEditor = setupEditor()
    expect(pastePlainText(taskEditor, '- [ ] Task A\n- [x] Task B')).toBe(true)
    expect(getDocNodes(taskEditor)[0]?.type).toBe('taskList')
    expect(taskEditor.getMarkdown().trimEnd()).toBe('- [ ] Task A\n- [x] Task B')

    const checklistEditor = setupEditor()
    expect(
      pastePlainText(checklistEditor, '<Checklist>\n\n- [ ] Interactive step\n\n</Checklist>'),
    ).toBe(true)
    expect(getDocNodes(checklistEditor)[0]?.attrs?.interactive).toBe(true)
    expect(checklistEditor.getMarkdown().trimEnd()).toBe(
      '<Checklist>\n\n- [ ] Interactive step\n\n</Checklist>',
    )

    const calloutEditor = setupEditor()
    expect(pastePlainText(calloutEditor, '> [!NOTE] Heads up\n> Read carefully')).toBe(true)
    expect(getDocNodes(calloutEditor)[0]?.type).toBe('callout')
    expect(calloutEditor.getMarkdown().trimEnd()).toBe('> [!NOTE] Heads up\n> Read carefully')

    const codeEditor = setupEditor()
    expect(pastePlainText(codeEditor, '```ts title="app.ts" highlight="1"\nconst a = 1\n```')).toBe(
      true,
    )
    expect(getDocNodes(codeEditor)[0]?.attrs).toEqual({
      language: 'ts',
      title: 'app.ts',
      highlight: '1',
      add: '',
      remove: '',
      startLine: 1,
      lineNumbers: true,
    })
  })

  test('inserts formatted inline Markdown into an existing paragraph without breaking it apart', () => {
    const editor = setupEditor('Prefix ')
    editor.commands.setTextSelection(Math.max(1, editor.state.doc.content.size - 1))

    expect(pastePlainText(editor, '**bold** and ++underlined++')).toBe(true)
    expect(getDocNodes(editor)).toHaveLength(1)
    expect(editor.getMarkdown()).toBe('Prefix **bold** and ++underlined++')
  })

  test('ignores paste inside code blocks, HTML clipboard, VS Code clipboard, bare YouTube URLs, and plain prose', () => {
    const codeEditor = setupEditor('```ts\n\n```')
    editorFocusInsideFirstChild(codeEditor)
    expect(pastePlainText(codeEditor, '- [ ] Not parsed in code')).toBe(false)

    const htmlEditor = setupEditor()
    expect(pastePlainText(htmlEditor, '**bold**', { 'text/html': '<b>bold</b>' })).toBe(false)

    const vscodeEditor = setupEditor()
    const markdownPastePlugin = getMarkdownPastePlugin(vscodeEditor)
    expect(markdownPastePlugin).toBeDefined()
    expect(
      markdownPastePlugin?.props.handlePaste?.call(
        markdownPastePlugin,
        vscodeEditor.view,
        new HeadlessClipboardEvent({
          'text/plain': '**bold**',
          'vscode-editor-data': '{"mode":"markdown"}',
        }),
        new Slice(Fragment.empty, 0, 0),
      ),
    ).toBeFalsy()

    // End-to-end paste passes through to CodeBlockVSCodeHandler rather than MarkdownPaste.
    expect(
      pastePlainText(vscodeEditor, '**bold**', { 'vscode-editor-data': '{"mode":"markdown"}' }),
    ).toBe(true)
    expect(getDocNodes(vscodeEditor)[0]?.type).toBe('codeBlock')

    const youtubeEditor = setupEditor()
    expect(pastePlainText(youtubeEditor, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false)

    const plainEditor = setupEditor()
    expect(pastePlainText(plainEditor, 'Just a normal sentence without markdown.')).toBe(false)
  })
})

function editorFocusInsideFirstChild(editor: Editor): void {
  const firstNode = editor.state.doc.firstChild
  if (firstNode) {
    editor.commands.setTextSelection(1)
  }
}

describe('MarkdownManager round-trips for custom nodes and marks', () => {
  test('round-trips CalloutNode including note, inline-formatted titles, multiple body blocks, and clean spacing', () => {
    const editor = setupEditor()
    const input = [
      '> [!NOTE] Custom **bold** title',
      '> First body paragraph',
      '>',
      '> Second body paragraph',
      '',
      'Following paragraph.',
    ].join('\n')

    const parsed = editor.markdown?.parse(input)
    expect(parsed?.content?.map((node) => node.type)).toEqual(['callout', 'paragraph'])
    expect(parsed?.content?.[0]?.attrs?.type).toBe('note')

    const serialized = parsed ? editor.markdown?.serialize(parsed) : ''
    expect(serialized).toBe(input)
  })

  test('round-trips HighlightMark, TextStyleMark, UnderlineMark, and ImageNode cleanly', () => {
    const editor = setupEditor()
    const input = [
      '==default highlight== and ++underlined text++',
      '',
      '<mark data-color="var(--editor-bg-yellow)" style="background-color: var(--editor-bg-yellow); color: inherit">colored highlight</mark> and <span data-color="var(--editor-text-blue)" style="color: var(--editor-text-blue)">blue text</span>',
      '',
      '![Preview](https://example.com/demo.png "Demo caption")',
    ].join('\n')

    const parsed = editor.markdown?.parse(input)
    const serialized = parsed ? editor.markdown?.serialize(parsed) : ''
    expect(serialized).toBe(input)
  })
})
