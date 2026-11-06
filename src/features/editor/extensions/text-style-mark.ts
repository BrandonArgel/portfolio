import { getStyleProperty, type MarkdownToken } from '@tiptap/core'
import Color, { type ColorOptions } from '@tiptap/extension-color'
import { TextStyle, type TextStyleOptions } from '@tiptap/extension-text-style'

import { extractColorFromAttrs, matchBalancedHtmlTag, normalizeEditorColor } from '../config/colors'

interface TextStyleMarkdownToken extends MarkdownToken {
  color?: string | null
}

export const TextStyleMark = TextStyle.extend<TextStyleOptions>({
  name: 'textStyle',

  priority: 102,

  parseHTML() {
    return [
      {
        tag: 'span',
        consuming: false,
        getAttrs: (element) => {
          if (!element.hasAttribute('style') && !element.hasAttribute('data-color')) {
            return false
          }
          return {}
        },
      },
    ]
  },

  renderMarkdown: (node, helpers) => {
    const content = helpers.renderChildren(node)
    const color = normalizeEditorColor(node.attrs?.color as string | undefined, 'text')

    if (!color) {
      return content
    }

    return `<span data-color="${color}" style="color: ${color}">${content}</span>`
  },

  parseMarkdown: (token, helpers) => {
    const textStyleToken = token as TextStyleMarkdownToken
    const color = normalizeEditorColor(textStyleToken.color, 'text')
    const inlineContent = helpers.parseInline(token.tokens || [])

    if (!color) {
      return inlineContent
    }

    return helpers.applyMark('textStyle', inlineContent, { color })
  },

  markdownTokenizer: {
    name: 'textStyle',
    level: 'inline',

    start: (src: string) => src.search(/<span\b/i),

    tokenize(src, _tokens, lexer) {
      if (!/^<span\b/i.test(src)) return undefined

      const matched = matchBalancedHtmlTag(src, 'span')
      if (!matched) return undefined

      const rawColor = extractColorFromAttrs(matched.attrsRaw, 'color')
      const color = normalizeEditorColor(rawColor, 'text')
      if (!color) return undefined

      return {
        type: 'textStyle',
        raw: matched.raw,
        text: matched.innerContent,
        color,
        tokens: lexer.inlineTokens(matched.innerContent),
      } satisfies TextStyleMarkdownToken
    },
  },
})

export const ColorExtension = Color.extend<ColorOptions>({
  name: 'color',

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const raw =
                element.getAttribute('data-color') ||
                getStyleProperty(element, 'color') ||
                element.style.color
              return normalizeEditorColor(raw, 'text')
            },
            renderHTML: (attributes: Record<string, unknown>) => {
              const color = normalizeEditorColor(attributes.color as string | undefined, 'text')
              if (!color) {
                return {}
              }

              return {
                'data-color': color,
                style: `color: ${color}`,
              }
            },
          },
        },
      },
    ]
  },
})
