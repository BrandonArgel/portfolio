import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { CalloutComponent } from '../components/callout'
import { DEFAULT_CALLOUT_TYPE, isCalloutType } from '../config/callout'
import { MDX_REGEX } from '../config/regex'

export const CalloutNode = Node.create({
  name: 'callout',

  group: 'block',
  content: 'block+',

  defining: true,
  isolating: true,

  addAttributes() {
    return {
      type: {
        default: DEFAULT_CALLOUT_TYPE,

        parseHTML: (element) => element.getAttribute('data-callout-type') ?? DEFAULT_CALLOUT_TYPE,

        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type,
        }),
      },

      title: {
        default: 'INFO',

        parseHTML: (element) => element.getAttribute('data-callout-title') ?? 'INFO',

        renderHTML: (attributes) => ({
          'data-callout-title': attributes.title,
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
      selectedOnTextSelection: true,
    })
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: MDX_REGEX.calloutPrefix,
        type: this.type,

        getAttributes: (match) => {
          const type = match[1].toLowerCase()

          if (!isCalloutType(type)) {
            return {
              type: DEFAULT_CALLOUT_TYPE,
              title: 'INFO',
            }
          }

          return {
            type,
            title: type.toUpperCase(),
          }
        },
      }),
    ]
  },

  markdownTokenizer: {
    name: 'callout',
    level: 'block',

    start: (src) => src.indexOf(':::'),

    tokenize: (src, _tokens, lexer) => {
      const match = /^:::(\w+)(?:\s+([^\n]*))?\n([\s\S]*?)\n:::\n?/.exec(src)

      if (!match) {
        return undefined
      }

      const type = match[1].toLowerCase()

      if (!isCalloutType(type)) {
        return undefined
      }

      const title = match[2]?.trim() || type.toUpperCase()
      const text = match[3]

      return {
        type: 'callout',
        raw: match[0],
        calloutType: type,
        calloutTitle: title,
        text,
        tokens: lexer.blockTokens(text),
      }
    },
  },

  parseMarkdown: (token, helpers) => {
    const type =
      typeof token.calloutType === 'string' && isCalloutType(token.calloutType)
        ? token.calloutType
        : DEFAULT_CALLOUT_TYPE

    const title =
      typeof token.calloutTitle === 'string' && token.calloutTitle.trim()
        ? token.calloutTitle.trim()
        : type.toUpperCase()

    const content = helpers.parseChildren(token.tokens ?? [])

    return {
      type: 'callout',
      attrs: {
        type,
        title,
      },
      content:
        content.length > 0
          ? content
          : [
              {
                type: 'paragraph',
              },
            ],
    }
  },

  renderMarkdown: (node, helpers) => {
    const type =
      typeof node.attrs?.type === 'string' && isCalloutType(node.attrs.type)
        ? node.attrs.type
        : DEFAULT_CALLOUT_TYPE

    const title =
      typeof node.attrs?.title === 'string' && node.attrs.title.trim()
        ? node.attrs.title.trim()
        : type.toUpperCase()

    const content = helpers.renderChildren(node.content ?? []).trim()

    return [`:::${type} ${title}`, content, ':::', ''].join('\n')
  },

  addKeyboardShortcuts() {
    return {
      ArrowUp: ({ editor }) => {
        if (!editor.isActive('callout')) {
          return false
        }

        if (!editor.view.endOfTextblock('up')) {
          return false
        }

        const { $head } = editor.state.selection
        const calloutPos = $head.before($head.depth)
        const dom = editor.view.nodeDOM(calloutPos)

        if (!(dom instanceof HTMLElement)) {
          return false
        }

        const input = dom.querySelector<HTMLInputElement>('input')

        if (!input) {
          return false
        }

        editor.commands.blur()

        requestAnimationFrame(() => {
          input.focus()
          input.setSelectionRange(input.value.length, input.value.length)
        })

        return true
      },

      ArrowLeft: ({ editor }) => {
        if (!editor.isActive('callout')) {
          return false
        }

        const { $head, empty } = editor.state.selection

        if (!empty) {
          return false
        }

        const calloutPos = $head.before($head.depth)

        if ($head.pos !== calloutPos + 1) {
          return false
        }

        const dom = editor.view.nodeDOM(calloutPos)

        if (!(dom instanceof HTMLElement)) {
          return false
        }

        const input = dom.querySelector<HTMLInputElement>('input')

        if (!input) {
          return false
        }

        editor.commands.blur()

        requestAnimationFrame(() => {
          input.focus()
          input.setSelectionRange(0, 0)
        })

        return true
      },
    }
  },
})
