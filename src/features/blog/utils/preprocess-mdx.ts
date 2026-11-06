import { extractColorFromAttrs, normalizeEditorColor } from '@/features/editor/config/colors'

/**
 * Matches fenced code blocks (```...``` or ~~~...~~~) or inline code spans (`...`)
 * so that non-code MDX transformations never corrupt source code literals.
 */
const CODE_SEGMENT_REGEX = /(^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\2[ \t]*$)|(`+[^`\n]+`+)/gm

function transformNonCodeSegment(segment: string): string {
  return (
    segment
      // 1. Convert Tiptap's YouTube directive syntax into the <YouTube /> MDX component
      .replace(/:::youtube\s*\{([^}]+)\}\s*:::/g, '<YouTube $1 />')
      // 2. Convert <mark ...> and <span ...> into PascalCase <MdxMark> and <MdxSpan>
      //    so MDX v3 routes them through our custom components instead of raw intrinsic HTML tags
      //    (and strip HTML string `style="..."` which MDX JSX rejects).
      .replace(/<(mark|span)\b([^>]*)>/gi, (_fullMatch, rawTag: string, attrs: string) => {
        const tag = rawTag.toLowerCase() as 'mark' | 'span'
        const componentName = tag === 'mark' ? 'MdxMark' : 'MdxSpan'

        if (!/\b(?:data-color|color|style)\s*=/i.test(attrs)) {
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
      .replace(/<\/mark\s*>/gi, '</MdxMark>')
      .replace(/<\/span\s*>/gi, '</MdxSpan>')
      // 3. Convert Markdown default highlight `==text==` into `<MdxMark>text</MdxMark>`
      .replace(/(?<!=)==(?!=|\s)([^\n=]+?)(?<!\s|=)==(?!=)/g, '<MdxMark>$1</MdxMark>')
      // 4. Convert Tiptap Markdown underline `++text++` and `<u>` into `<MdxU>text</MdxU>`
      .replace(/(?<!\+)\+\+(?!\+|\s)([^\n+]+?)(?<!\s|\+)\+\+(?!\+)/g, '<MdxU>$1</MdxU>')
      .replace(/<u\b[^>]*>/gi, '<MdxU>')
      .replace(/<\/u\s*>/gi, '</MdxU>')
      // 5. Ensure lines starting directly with inline MDX mark components are parsed as paragraphs
      //    (mdxJsxTextElement inside <p>) rather than bare flow elements.
      .replace(/^(?=<(?:MdxSpan|MdxMark|MdxU)\b)/gm, '\u200B')
  )
}

/**
 * Pre-processes raw Tiptap Markdown/MDX before passing it to `next-mdx-remote`,
 * preserving fenced code blocks and inline code spans while normalizing custom
 * editor syntax (YouTube directives, colored `<span data-color>`, `<mark data-color>`,
 * `==highlight==`, and `++underline++`).
 */
export function preprocessMdxContent(content: string): string {
  if (!content) return ''

  let result = ''
  let lastIndex = 0

  for (const match of content.matchAll(CODE_SEGMENT_REGEX)) {
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
