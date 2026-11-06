import type { Highlighter } from '@tanstack/highlight/core'
import { findChildren } from '@tiptap/core'
import CodeBlock, { type CodeBlockOptions } from '@tiptap/extension-code-block'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { highlighter as defaultHighlighter } from '@/lib/highlighter'
import { CodeBlockComponent } from '../components/code-block'

export interface CodeBlockHighlightOptions extends CodeBlockOptions {
  highlighter: Highlighter
}

const highlightPluginKey = new PluginKey<DecorationSet>('tanstack-highlight')

function buildDecorations(
  doc: ProseMirrorNode,
  nodeName: string,
  highlighter: Highlighter,
  defaultLanguage: string | null | undefined,
): DecorationSet {
  const decorations: Decoration[] = []
  const codeBlocks = findChildren(doc, (node) => node.type.name === nodeName)

  for (const block of codeBlocks) {
    const code = block.node.textContent
    if (!code) continue

    const rawLang =
      typeof block.node.attrs.language === 'string' && block.node.attrs.language
        ? block.node.attrs.language
        : (defaultLanguage ?? 'plaintext')

    const { tokens } = highlighter.tokenize(code, { lang: rawLang })
    let offset = block.pos + 1

    for (const token of tokens) {
      const from = offset
      const to = from + token.value.length

      if (token.className && to > from) {
        decorations.push(
          Decoration.inline(from, to, {
            class: `th-token th-${token.className}`,
          }),
        )
      }

      offset = to
    }
  }

  return DecorationSet.create(doc, decorations)
}

function createHighlightPlugin({
  name,
  highlighter,
  defaultLanguage,
}: {
  name: string
  highlighter: Highlighter
  defaultLanguage: string | null | undefined
}): Plugin<DecorationSet> {
  return new Plugin<DecorationSet>({
    key: highlightPluginKey,
    state: {
      init: (_, { doc }) => buildDecorations(doc, name, highlighter, defaultLanguage),
      apply: (transaction, decorationSet, oldState, newState) => {
        if (!transaction.docChanged) {
          return decorationSet
        }

        const oldBlocks = findChildren(oldState.doc, (node) => node.type.name === name)
        const newBlocks = findChildren(newState.doc, (node) => node.type.name === name)

        const hasCodeBlockChanged =
          oldBlocks.length !== newBlocks.length ||
          newBlocks.some((newBlock, index) => oldBlocks[index]?.node !== newBlock.node)

        if (hasCodeBlockChanged) {
          return buildDecorations(transaction.doc, name, highlighter, defaultLanguage)
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },
    props: {
      decorations(state) {
        return highlightPluginKey.getState(state)
      },
    },
  })
}

export const CodeBlockNode = CodeBlock.extend<CodeBlockHighlightOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      highlighter: defaultHighlighter,
      languageClassPrefix: 'language-',
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      exitOnArrowUp: true,
      defaultLanguage: 'plaintext',
      enableTabIndentation: false,
      tabSize: 4,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      lineNumbers: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-line-numbers') !== 'false',
        renderHTML: (attributes) => {
          if (attributes.lineNumbers === false) {
            return { 'data-line-numbers': 'false' }
          }
          return { 'data-line-numbers': 'true' }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      createHighlightPlugin({
        name: this.name,
        highlighter: this.options.highlighter,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ]
  },
})
