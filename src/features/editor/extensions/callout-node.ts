import {
  InputRule,
  type JSONContent,
  type MarkdownToken,
  mergeAttributes,
  Node,
} from '@tiptap/core'
import { Fragment, type NodeType } from '@tiptap/pm/model'
import { type EditorState, TextSelection } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'

import {
  CALLOUT_ALERT_INPUT_RULE,
  CALLOUT_BLOCK,
  CALLOUT_BLOCK_START,
  CALLOUT_DIRECTIVE_INPUT_RULE,
  CALLOUT_LINE_PREFIX,
  type CalloutType,
  DEFAULT_CALLOUT_TYPE,
  getCalloutLabel,
  isCalloutType,
  normalizeCalloutType,
} from '@/lib/markdown-regex'
import { CalloutComponent } from '../components/callout'

// ─── Token metadata shape ────────────────────────────────────────────────────

interface CalloutTokenMeta {
  type: CalloutType
  titleTokens: MarkdownToken[]
  bodyTokens: MarkdownToken[]
}

function isCalloutTokenMeta(value: unknown): value is CalloutTokenMeta {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    isCalloutType(value.type) &&
    'titleTokens' in value &&
    Array.isArray(value.titleTokens) &&
    'bodyTokens' in value &&
    Array.isArray(value.bodyTokens)
  )
}

function applyCalloutInputRule({
  state,
  range,
  rawType,
  calloutNodeType,
  requireQuoteOrBlockquote,
  rawMatch,
}: {
  state: EditorState
  range: { from: number; to: number }
  rawType: string | undefined
  calloutNodeType: NodeType
  requireQuoteOrBlockquote: boolean
  rawMatch: string
}): null | undefined {
  const candidateType = rawType?.toLowerCase()
  if (!isCalloutType(candidateType)) {
    return null
  }

  const calloutTitleType = state.schema.nodes.calloutTitle
  const paragraphType = state.schema.nodes.paragraph
  if (!calloutTitleType || !paragraphType) {
    return null
  }

  const { $from } = state.selection
  if ($from.parent.type !== paragraphType || $from.depth < 1) {
    return null
  }

  const parentDepth = $from.depth - 1
  const parentNode = $from.node(parentDepth)
  const isInsideBlockquote = parentDepth > 0 && parentNode.type.name === 'blockquote'
  const hasQuotePrefix = CALLOUT_LINE_PREFIX.test(rawMatch.trimStart())

  if (requireQuoteOrBlockquote && !hasQuotePrefix && !isInsideBlockquote) {
    return null
  }

  if (isInsideBlockquote) {
    const bqGrandParentDepth = parentDepth - 1
    if (
      !$from
        .node(bqGrandParentDepth)
        .canReplaceWith(
          $from.index(bqGrandParentDepth),
          $from.indexAfter(bqGrandParentDepth),
          calloutNodeType,
        )
    ) {
      return null
    }
  } else if (
    !parentNode.canReplaceWith(
      $from.index(parentDepth),
      $from.indexAfter(parentDepth),
      calloutNodeType,
    )
  ) {
    return null
  }

  const { tr } = state
  tr.delete(range.from, range.to)

  const $afterDelete = tr.doc.resolve(range.from)
  const titleNode = calloutTitleType.create(null, state.schema.text(getCalloutLabel(candidateType)))
  const bodyParagraph = paragraphType.create(null, $afterDelete.parent.content)
  const calloutNode = calloutNodeType.create({ type: candidateType }, [titleNode, bodyParagraph])

  if (isInsideBlockquote) {
    const bqDepth = $afterDelete.depth - 1
    const bqStart = $afterDelete.before(bqDepth)
    const bqEnd = $afterDelete.after(bqDepth)
    const bqNode = $afterDelete.node(bqDepth)
    const childIndex = $afterDelete.index(bqDepth)

    const beforeItems = bqNode.content.content.slice(0, childIndex)
    const afterItems = bqNode.content.content.slice(childIndex + 1)

    const beforeBlockquote =
      beforeItems.length > 0 ? bqNode.type.create(bqNode.attrs, Fragment.from(beforeItems)) : null
    const afterBlockquote =
      afterItems.length > 0 ? bqNode.type.create(bqNode.attrs, Fragment.from(afterItems)) : null

    const replacementNodes = [
      ...(beforeBlockquote ? [beforeBlockquote] : []),
      calloutNode,
      ...(afterBlockquote ? [afterBlockquote] : []),
    ]

    const calloutOffset = beforeBlockquote ? beforeBlockquote.nodeSize : 0
    const bodyCursorPos = bqStart + calloutOffset + 1 + titleNode.nodeSize + 1

    tr.replaceWith(bqStart, bqEnd, replacementNodes)
    tr.setSelection(TextSelection.create(tr.doc, bodyCursorPos))
    tr.scrollIntoView()
    return
  }

  const pStart = $afterDelete.before()
  const pEnd = $afterDelete.after()
  const bodyCursorPos = pStart + 1 + titleNode.nodeSize + 1

  tr.replaceWith(pStart, pEnd, calloutNode)
  tr.setSelection(TextSelection.create(tr.doc, bodyCursorPos))
  tr.scrollIntoView()
}

// ─── Node Definition ─────────────────────────────────────────────────────────

export const CalloutNode = Node.create({
  name: 'callout',

  group: 'block',

  /**
   * The callout must contain exactly one `calloutTitle` followed by one or
   * more block nodes (paragraphs, lists, code blocks, etc.).
   */
  content: 'calloutTitle block+',

  defining: true,

  isolating: true,

  allowGapCursor: true,

  addAttributes() {
    return {
      type: {
        default: DEFAULT_CALLOUT_TYPE,

        parseHTML: (element) => {
          return normalizeCalloutType(element.getAttribute('data-callout-type'))
        },

        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'callout',
        },
        HTMLAttributes,
      ),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent, {
      contentDOMElementTag: 'div',
      selectedOnTextSelection: true,
    })
  },

  addInputRules() {
    return [
      new InputRule({
        find: CALLOUT_ALERT_INPUT_RULE,
        handler: ({ state, range, match }) =>
          applyCalloutInputRule({
            state,
            range,
            rawType: match[1],
            calloutNodeType: this.type,
            requireQuoteOrBlockquote: true,
            rawMatch: match[0],
          }),
      }),
      new InputRule({
        find: CALLOUT_DIRECTIVE_INPUT_RULE,
        handler: ({ state, range, match }) =>
          applyCalloutInputRule({
            state,
            range,
            rawType: match[1],
            calloutNodeType: this.type,
            requireQuoteOrBlockquote: false,
            rawMatch: match[0],
          }),
      }),
    ]
  },

  // ─── Markdown Tokenizer ──────────────────────────────────────────────────
  // Custom marked.js tokenizer that intercepts GFM blockquotes beginning
  // with the `[!TYPE]` marker.

  markdownTokenizer: {
    name: 'callout',
    level: 'block',

    start: (src) => {
      const match = src.match(CALLOUT_BLOCK_START)
      return match?.index ?? -1
    },

    tokenize: (src, _tokens, lexer) => {
      // Match: > [!TYPE] optional title followed by continuation lines
      const match = CALLOUT_BLOCK.exec(src)

      if (!match) {
        return undefined
      }

      const rawType = match[1].toLowerCase()

      if (!isCalloutType(rawType)) {
        return undefined
      }

      const title = match[2].trim()

      const bodyRaw = match[3] ?? ''
      const bodyContent = bodyRaw
        .split('\n')
        .map((line) => line.replace(CALLOUT_LINE_PREFIX, ''))
        .join('\n')
        .trim()

      return {
        type: 'callout',
        raw: match[0],
        meta: {
          type: rawType,
          titleTokens: title ? lexer.inlineTokens(title) : [],
          bodyTokens: bodyContent ? lexer.blockTokens(bodyContent) : [],
        } satisfies CalloutTokenMeta,
      }
    },
  },

  // ─── Markdown Parser ──────────────────────────────────────────────────────
  // Converts a tokenized callout into the ProseMirror JSONContent tree:
  //   callout { type }
  //     calloutTitle  →  inline content from the title tokens
  //     paragraph+    →  parsed from the body tokens

  parseMarkdown: (token, helpers) => {
    const meta = token.meta

    if (!isCalloutTokenMeta(meta)) {
      return []
    }

    const calloutType = normalizeCalloutType(meta.type)

    // Build the calloutTitle node
    const titleContent: JSONContent[] =
      meta.titleTokens.length > 0 ? helpers.parseInline(meta.titleTokens) : []

    const titleNode: JSONContent = {
      type: 'calloutTitle',
      content: titleContent.length > 0 ? titleContent : undefined,
    }

    // Parse body tokens into block-level children
    const bodyNodes: JSONContent[] =
      meta.bodyTokens.length > 0
        ? (helpers.parseBlockChildren?.(meta.bodyTokens) ?? helpers.parseChildren(meta.bodyTokens))
        : [{ type: 'paragraph' }]

    return {
      type: 'callout',
      attrs: {
        type: calloutType,
      },
      content: [titleNode, ...bodyNodes],
    }
  },

  // ─── Markdown Serializer ──────────────────────────────────────────────────
  // Produces the GFM callout syntax:
  //   > [!TYPE] Custom Title
  //   > body paragraph line 1
  //   >
  //   > > [!NESTED] Nested Title
  //   > > nested body

  renderMarkdown: (node, helpers) => {
    const type = normalizeCalloutType(node.attrs?.type)
    const children = Array.isArray(node.content) ? node.content : []

    // First child is calloutTitle
    const titleNode = children[0]
    const bodyNodes = children.slice(1)

    // Render the inline title text
    let titleText = ''
    if (titleNode && Array.isArray(titleNode.content) && titleNode.content.length > 0) {
      titleText = helpers.renderChildren(titleNode).trim()
    }

    // Build the header line
    const headerLine = titleText
      ? `> [!${type.toUpperCase()}] ${titleText}`
      : `> [!${type.toUpperCase()}]`

    if (bodyNodes.length === 0) {
      return headerLine
    }

    const prefix = '>'
    const bodyBlocks: string[] = []

    bodyNodes.forEach((child, index) => {
      const childContent = helpers.renderChild?.(child, index) ?? helpers.renderChildren([child])

      const trimmedChild = childContent.trim()
      if (!trimmedChild) return

      const lines = trimmedChild.split('\n')
      const linesWithPrefix = lines.map((line) => {
        if (line.trim() === '') {
          return prefix
        }
        return `${prefix} ${line}`
      })

      bodyBlocks.push(linesWithPrefix.join('\n'))
    })

    if (bodyBlocks.length === 0) {
      return headerLine
    }

    // Add empty blockquote separator lines (`\n>\n`) between distinct block children
    const bodyMarkdown = bodyBlocks.join(`\n${prefix}\n`)
    return `${headerLine}\n${bodyMarkdown}`
  },
})
