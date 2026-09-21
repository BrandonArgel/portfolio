import { type JSONContent, type MarkdownToken, mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CalloutComponent } from '../components/callout'
import {
  type CalloutType,
  DEFAULT_CALLOUT_TYPE,
  isCalloutType,
  normalizeCalloutType,
} from '../config/callout'

// ─── Token metadata shape ────────────────────────────────────────────────────

interface CalloutTokenMeta {
  type: CalloutType
  title: string
  bodyTokens: MarkdownToken[]
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

  // ─── Markdown Tokenizer ──────────────────────────────────────────────────
  // Custom marked.js tokenizer that intercepts GFM blockquotes beginning
  // with the `[!TYPE]` marker.

  markdownTokenizer: {
    name: 'callout',
    level: 'block',

    start: (src) => {
      const match = src.match(/^>\s*\[!/m)
      return match?.index ?? -1
    },

    tokenize: (src, _tokens, lexer) => {
      // Match: > [!TYPE] optional title followed by continuation lines
      const match = /^>\s*\[!([A-Za-z]+)\]\s*(.*?)(?:\n((?:>\s?.*(?:\n|$))*)|$)/.exec(src)

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
        .map((line) => line.replace(/^>\s?/, ''))
        .join('\n')
        .trim()

      return {
        type: 'callout',
        raw: match[0],
        meta: {
          type: rawType,
          title,
          bodyTokens: bodyContent ? lexer.blockTokens(bodyContent) : [],
        } satisfies CalloutTokenMeta,
      }
    },
  },

  // ─── Markdown Parser ──────────────────────────────────────────────────────
  // Converts a tokenized callout into the ProseMirror JSONContent tree:
  //   callout { type }
  //     calloutTitle  →  inline text from the title capture
  //     paragraph+    →  parsed from the body tokens

  parseMarkdown: (token, helpers) => {
    const meta = token.meta as CalloutTokenMeta | undefined

    if (!meta) {
      return null as unknown as JSONContent
    }

    const calloutType = normalizeCalloutType(meta.type)

    // Build the calloutTitle node
    const titleContent: JSONContent[] = meta.title ? [helpers.createTextNode(meta.title)] : []

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
      return `${headerLine}\n`
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
      return `${headerLine}\n`
    }

    // Add empty blockquote separator lines (`\n>\n`) between distinct block children
    const bodyMarkdown = bodyBlocks.join(`\n${prefix}\n`)
    return `${headerLine}\n${bodyMarkdown}\n`
  },
})
