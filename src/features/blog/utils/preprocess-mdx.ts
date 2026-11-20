import { extractColorFromAttrs, normalizeEditorColor } from '@/features/editor/config/colors'
import {
  COLOR_STYLE_ATTR_CHECK,
  HIGHLIGHT_INLINE,
  LEADING_INLINE_MDX_TAG,
  MARK_CLOSE_TAG,
  MARK_OR_SPAN_OPEN_TAG,
  MDX_VERBATIM_SEGMENT_REGEX,
  SPAN_CLOSE_TAG,
  UNDERLINE_CLOSE_TAG,
  UNDERLINE_INLINE,
  UNDERLINE_OPEN_TAG,
  YOUTUBE_DIRECTIVE,
} from '@/lib/markdown-regex'

function transformNonCodeSegment(segment: string): string {
  return (
    segment
      // 1. Convert Tiptap's YouTube directive syntax into the <YouTube /> MDX component
      .replace(YOUTUBE_DIRECTIVE, '<YouTube $1 />')
      // 2. Convert <mark ...> and <span ...> into PascalCase <MdxMark> and <MdxSpan>
      //    so MDX v3 routes them through our custom components instead of raw intrinsic HTML tags
      //    (and strip HTML string `style="..."` which MDX JSX rejects).
      .replace(MARK_OR_SPAN_OPEN_TAG, (_fullMatch, rawTag: string, attrs: string) => {
        const tag = rawTag.toLowerCase() as 'mark' | 'span'
        const componentName = tag === 'mark' ? 'MdxMark' : 'MdxSpan'

        if (!COLOR_STYLE_ATTR_CHECK.test(attrs)) {
          return `<${componentName}>`
        }

        const styleProp = tag === 'mark' ? 'background-color' : 'color'
        const colorType = tag === 'mark' ? 'highlight' : 'text'
        const rawColor = extractColorFromAttrs(attrs, styleProp)
        const normalizedColor = normalizeEditorColor(rawColor, colorType)

        if (normalizedColor) {
          return `<${componentName} data-color="${normalizedColor}" color="${normalizedColor}">`
        }

        return `<${componentName}>`
      })
      .replace(MARK_CLOSE_TAG, '</MdxMark>')
      .replace(SPAN_CLOSE_TAG, '</MdxSpan>')
      // 3. Convert Markdown default highlight `==text==` into `<MdxMark>text</MdxMark>`
      .replace(HIGHLIGHT_INLINE, '<MdxMark>$1</MdxMark>')
      // 4. Convert Tiptap Markdown underline `++text++` and `<u>` into `<MdxU>text</MdxU>`
      .replace(UNDERLINE_INLINE, '<MdxU>$1</MdxU>')
      .replace(UNDERLINE_OPEN_TAG, '<MdxU>')
      .replace(UNDERLINE_CLOSE_TAG, '</MdxU>')
      // 5. Ensure lines starting directly with inline MDX mark components are parsed as paragraphs
      //    (mdxJsxTextElement inside <p>) rather than bare flow elements.
      .replace(LEADING_INLINE_MDX_TAG, '\u200B')
  )
}

/**
 * Pre-processes raw Tiptap Markdown/MDX before passing it to `next-mdx-remote`,
 * preserving fenced code blocks, inline code spans, and `<Chart ... />` tags while
 * normalizing custom editor syntax (YouTube directives, colored `<span data-color>`,
 * `<mark data-color>`, `==highlight==`, and `++underline++`).
 */
export function preprocessMdxContent(content: string): string {
  if (!content) return ''

  let result = ''
  let lastIndex = 0

  for (const match of content.matchAll(MDX_VERBATIM_SEGMENT_REGEX)) {
    const matchIndex = match.index ?? 0
    if (matchIndex > lastIndex) {
      result += transformNonCodeSegment(content.slice(lastIndex, matchIndex))
    }
    result += match[0]
    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < content.length) {
    result += transformNonCodeSegment(content.slice(lastIndex))
  }

  return result
}
