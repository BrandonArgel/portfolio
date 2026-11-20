import type { Highlighter } from '@tanstack/highlight/core'
import { findChildren, textblockTypeInputRule } from '@tiptap/core'
import CodeBlock, { type CodeBlockOptions } from '@tiptap/extension-code-block'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { ReactNodeViewRenderer } from '@tiptap/react'

import {
  normalizeStartLine,
  parseCodeFenceInfo,
  serializeCodeFenceInfo,
} from '@/lib/code-block-meta'
import { highlighter as defaultHighlighter } from '@/lib/highlighter'
import { CODE_FENCE_INPUT_RULE } from '@/lib/markdown-regex'
import { CodeBlockComponent } from '../components/code-block'

interface CodeBlockHighlightOptions extends CodeBlockOptions {
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
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) =>
          attributes.title ? { 'data-title': String(attributes.title) } : {},
      },
      highlight: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-highlight') || '',
        renderHTML: (attributes) =>
          attributes.highlight ? { 'data-highlight': String(attributes.highlight) } : {},
      },
      add: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-add') || '',
        renderHTML: (attributes) => (attributes.add ? { 'data-add': String(attributes.add) } : {}),
      },
      remove: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-remove') || '',
        renderHTML: (attributes) =>
          attributes.remove ? { 'data-remove': String(attributes.remove) } : {},
      },
      startLine: {
        default: 1,
        parseHTML: (element) => normalizeStartLine(element.getAttribute('data-start-line')),
        renderHTML: (attributes) => {
          const startLine = normalizeStartLine(attributes.startLine)
          return startLine > 1 ? { 'data-start-line': String(startLine) } : {}
        },
      },
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

  parseMarkdown: (token, helpers) => {
    if (
      !token.raw?.startsWith('```') &&
      !token.raw?.startsWith('~~~') &&
      token.codeBlockStyle !== 'indented'
    ) {
      return []
    }

    const parsed = parseCodeFenceInfo(typeof token.lang === 'string' ? token.lang : '')

    return helpers.createNode(
      'codeBlock',
      {
        language: parsed.language || null,
        title: parsed.title,
        highlight: parsed.highlight,
        add: parsed.add,
        remove: parsed.remove,
        startLine: parsed.startLine,
        lineNumbers: parsed.lineNumbers,
      },
      token.text ? [helpers.createTextNode(token.text)] : [],
    )
  },

  renderMarkdown: (node, h) => {
    const attrs = (node.attrs ?? {}) as {
      language?: string | null
      title?: string | null
      highlight?: string | null
      add?: string | null
      remove?: string | null
      startLine?: unknown
      lineNumbers?: boolean | null
    }
    const fenceInfo = serializeCodeFenceInfo(attrs)

    if (!node.content || node.content.length === 0) {
      return `\`\`\`${fenceInfo}\n\n\`\`\``
    }

    return [`\`\`\`${fenceInfo}`, h.renderChildren(node.content), '```'].join('\n')
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: CODE_FENCE_INPUT_RULE,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1] ? match[1].toLowerCase() : null,
        }),
      }),
    ]
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
