import { getStyleProperty, type MarkdownToken } from '@tiptap/core'
import Highlight, { type HighlightOptions } from '@tiptap/extension-highlight'

import { extractColorFromAttrs, matchBalancedHtmlTag, normalizeEditorColor } from '../config/colors'

interface HighlightMarkdownToken extends MarkdownToken {
  color?: string | null
}

export const HighlightMark = Highlight.extend<HighlightOptions>({
  name: 'highlight',

  priority: 101,

  addOptions(): HighlightOptions {
    return {
      ...this.parent?.(),
      multicolor: true,
      HTMLAttributes: {
        class: 'rounded-sm px-1',
      },
    }
  },

  addAttributes() {
    if (!this.options.multicolor) {
      return {}
    }

    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const raw =
            element.getAttribute('data-color') ||
            getStyleProperty(element, 'background-color') ||
            element.style.backgroundColor
          return normalizeEditorColor(raw, 'highlight')
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          const color = normalizeEditorColor(attributes.color as string | undefined, 'highlight')
          if (!color) {
            return {}
          }

          return {
            'data-color': color,
            style: `background-color: ${color}; color: inherit`,
          }
        },
      },
    }
  },

  renderMarkdown: (node, helpers) => {
    const content = helpers.renderChildren(node)
    const color = normalizeEditorColor(node.attrs?.color as string | undefined, 'highlight')

    if (!color) {
      return `==${content}==`
    }

    return `<mark data-color="${color}" style="background-color: ${color}; color: inherit">${content}</mark>`
  },

  parseMarkdown: (token, helpers) => {
    const highlightToken = token as HighlightMarkdownToken
    const color = normalizeEditorColor(highlightToken.color, 'highlight')

    return helpers.applyMark(
      'highlight',
      helpers.parseInline(token.tokens || []),
      color ? { color } : undefined,
    )
  },

  markdownTokenizer: {
    name: 'highlight',
    level: 'inline',

    start: (src: string) => {
      const eqIdx = src.indexOf('==')
      const markIdx = src.search(/<mark\b/i)
      if (eqIdx === -1) return markIdx
      if (markIdx === -1) return eqIdx
      return Math.min(eqIdx, markIdx)
    },

    tokenize(src, _tokens, lexer) {
      if (/^<mark\b/i.test(src)) {
        const matched = matchBalancedHtmlTag(src, 'mark')
        if (matched) {
          const rawColor = extractColorFromAttrs(matched.attrsRaw, 'background-color')
          const color = normalizeEditorColor(rawColor, 'highlight')

          return {
            type: 'highlight',
            raw: matched.raw,
            text: matched.innerContent,
            color,
            tokens: lexer.inlineTokens(matched.innerContent),
          } satisfies HighlightMarkdownToken
        }
      }

      const eqMatch = /^(==)(?!=)([\s\S]+?)(==)(?!=)/.exec(src)
      if (eqMatch) {
        const innerContent = eqMatch[2].trim()
        if (!innerContent) return undefined

        return {
          type: 'highlight',
          raw: eqMatch[0],
          text: innerContent,
          color: null,
          tokens: lexer.inlineTokens(innerContent),
        } satisfies HighlightMarkdownToken
      }

      return undefined
    },
  },
})
