import { Extension, type JSONContent } from '@tiptap/core'
import { Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { looksLikeMarkdown } from '@/lib/markdown-regex'

const markdownPastePluginKey = new PluginKey('markdownPaste')

function hasInlineFormattingOrNode(nodes: JSONContent[]): boolean {
  return nodes.some((node) => {
    if (node.type !== 'text') return true
    return Array.isArray(node.marks) && node.marks.length > 0
  })
}

function hasStructuredMarkdownContent(nodes: JSONContent[]): boolean {
  return nodes.some((node) => {
    if (node.type !== 'paragraph') return true
    return Array.isArray(node.content) && hasInlineFormattingOrNode(node.content)
  })
}

export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: markdownPastePluginKey,
        props: {
          handlePaste: (view: EditorView, event: ClipboardEvent) => {
            if (!event.clipboardData || !this.editor.markdown) {
              return false
            }

            const files = Array.from(event.clipboardData.files || [])
            if (files.some((file) => file.type.startsWith('image/'))) {
              return false
            }

            if (event.clipboardData.getData('vscode-editor-data')) {
              return false
            }

            if (event.clipboardData.getData('text/html').trim().length > 0) {
              return false
            }

            const { selection } = view.state
            const { $from, $to } = selection
            if ($from.parent.type.spec.code || $from.marks().some((mark) => mark.type.spec.code)) {
              return false
            }

            const rawText = event.clipboardData.getData('text/plain')
            if (!rawText || !looksLikeMarkdown(rawText)) {
              return false
            }

            const normalized = rawText.replace(/\r\n?/g, '\n')
            const parsedDoc = this.editor.markdown.parse(normalized)
            if (
              !Array.isArray(parsedDoc.content) ||
              parsedDoc.content.length === 0 ||
              !hasStructuredMarkdownContent(parsedDoc.content)
            ) {
              return false
            }

            try {
              const docNode = view.state.schema.nodeFromJSON({
                type: 'doc',
                content: parsedDoc.content,
              })

              if (docNode.childCount === 0) {
                return false
              }

              const tr = view.state.tr

              if (
                docNode.childCount === 1 &&
                docNode.firstChild?.type.name === 'paragraph' &&
                $from.sameParent($to) &&
                $from.parent.isTextblock
              ) {
                tr.replaceSelection(new Slice(docNode.firstChild.content, 0, 0))
              } else if (
                selection.empty &&
                $from.depth === 1 &&
                $from.parent.type.name === 'paragraph' &&
                $from.parent.content.size === 0
              ) {
                const insertStart = $from.before()
                tr.replaceWith(insertStart, $from.after(), docNode.content)
                const targetPos = Math.min(tr.doc.content.size, insertStart + docNode.content.size)
                tr.setSelection(Selection.near(tr.doc.resolve(targetPos), -1))
              } else {
                tr.replaceSelection(new Slice(docNode.content, 0, 0))
              }

              event.preventDefault?.()
              tr.setMeta('paste', true)
              tr.scrollIntoView()
              view.dispatch(tr)
              return true
            } catch {
              return false
            }
          },
        },
      }),
    ]
  },
})
