export const CALLOUT_TYPES = [
  'tip',
  'info',
  'note',
  'pencil',
  'quote',
  'success',
  'warning',
  'failure',
  'danger',
  'bug',
  'example',
] as const

export type CalloutType = (typeof CALLOUT_TYPES)[number]

export const DEFAULT_CALLOUT_TYPE: CalloutType = 'info'

export function isCalloutType(value: unknown): value is CalloutType {
  return typeof value === 'string' && CALLOUT_TYPES.some((type) => type === value)
}

export function normalizeCalloutType(value: unknown): CalloutType {
  return isCalloutType(value) ? value : DEFAULT_CALLOUT_TYPE
}

export function getCalloutLabel(type: CalloutType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// ─── Callout Patterns ─────────────────────────────────────────────────────────

export const CALLOUT_BLOCK_START = /^>\s*\[!/m
export const CALLOUT_BLOCK = /^>\s*\[!([A-Za-z]+)\][ \t]*(.*?)(?:\r?\n((?:>\s?.*(?:\r?\n|$))*)|$)/
export const CALLOUT_LINE_PREFIX = /^>\s?/
export const CALLOUT_HEADER = /^\s*\[!([a-zA-Z]+)\](?:[ \t]+([^\n]*))?/
export const CALLOUT_MARKER_STRIP = /^\s*\[!([a-zA-Z]+)\][^\n]*(?:\n)?/
export const CALLOUT_ALERT_INPUT_RULE = /^\s*(?:>\s*)?\[!([a-zA-Z]+)\]\s$/
export const CALLOUT_DIRECTIVE_INPUT_RULE = /^:::([a-zA-Z]+)\s$/

// ─── Task List & <Checklist> Patterns ─────────────────────────────────────────

export const TASK_ITEM_INPUT_RULE = /^\s*(?:[-+*]\s+)?\[([ xX]?)\]\s$/
export const CHECKLIST_START = /^[ \t]*<Checklist(?:\s|>)/m
export const CHECKLIST_BLOCK =
  /^[ \t]*<Checklist(?:\s+([^>]*))?>[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<\/Checklist>[ \t]*(?:\r?\n|$)/
export const CHECKLIST_DISABLED_ATTR =
  /\bdisabled(?:\s*=\s*(?:\{\s*(true|false)\s*\}|"([^"]*)"|'([^']*)'))?/i
export const CHECKLIST_INTERACTIVE_ATTR =
  /\binteractive\s*=\s*(?:\{\s*(true|false)\s*\}|"([^"]*)"|'([^']*)')/i
export const LOOSE_TASK_GAP = /\r?\n(?:[ \t]*\r?\n)+(?=[ \t]*[-+*]\s+\[[ xX]\]\s+)/g

// ─── Chart MDX Patterns ──────────────────────────────────────────────────────

export const CHART_START = /^[ \t]*<Chart(?=\s|\/?>)/m
export const CHART_BLOCK =
  /^[ \t]*<Chart(?:\s+((?:[^>"']|"[^"]*"|'[^']*')*))?\s*\/>[ \t]*(?:\r?\n|$)/

// ─── Code Fence, Segmentation & Image Patterns ───────────────────────────────

export const CODE_FENCE_INPUT_RULE = /^(?:```|~~~)([a-zA-Z0-9_+#-]+)?[\s\n]$/
export const MDX_VERBATIM_SEGMENT_REGEX =
  /(^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\2[ \t]*$)|(`+[^`\n]+`+)|(^[ \t]*<Chart(?:\s+(?:[^>"']|"[^"]*"|'[^']*')*)?\s*\/>[ \t]*(?:\r?\n|$))/gm
export const IMAGE_INPUT_RULE = /(?:^|\s)(!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\))$/

// ─── Inline Marks & MDX Preprocessing Patterns ───────────────────────────────

export const MARK_TAG_START = /<mark\b/i
export const MARK_TAG_PREFIX = /^<mark\b/i
export const SPAN_TAG_START = /<span\b/i
export const SPAN_TAG_PREFIX = /^<span\b/i

export const HIGHLIGHT_TOKEN = /^(==)(?!=)([\s\S]+?)(==)(?!=)/
export const HIGHLIGHT_INLINE = /(?<!=)==(?!=|\s)([^\n=]+?)(?<!\s|=)==(?!=)/g

export const UNDERLINE_INPUT_RULE = /(?:^|\s)(\+\+(?!\s+\+\+)([^+\n]+)\+\+(?!\s+\+\+))$/
export const UNDERLINE_PASTE_RULE = /(?:^|\s)(\+\+(?!\s+\+\+)([^+\n]+)\+\+(?!\s+\+\+))/g
export const UNDERLINE_INLINE = /(?<!\+)\+\+(?!\+|\s)([^\n+]+?)(?<!\s|\+)\+\+(?!\+)/g

export const YOUTUBE_DIRECTIVE = /:::youtube\s*\{([^}]+)\}\s*:::/g
export const MARK_OR_SPAN_OPEN_TAG = /<(mark|span)\b([^>]*)>/gi
export const COLOR_STYLE_ATTR_CHECK = /\b(?:data-color|color|style)\s*=/i
export const MARK_CLOSE_TAG = /<\/mark\s*>/gi
export const SPAN_CLOSE_TAG = /<\/span\s*>/gi
export const UNDERLINE_OPEN_TAG = /<u\b[^>]*>/gi
export const UNDERLINE_CLOSE_TAG = /<\/u\s*>/gi
export const LEADING_INLINE_MDX_TAG = /^(?=<(?:MdxSpan|MdxMark|MdxU)\b)/gm

// ─── Paste Markdown Detection ─────────────────────────────────────────────────

const BARE_YOUTUBE_URL =
  /^https?:\/\/(?:(?:www|m|music)\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\/\S+$/i

const MARKDOWN_DETECTION_PATTERNS: readonly RegExp[] = [
  /^[ \t]*#{1,6}[ \t]+\S/m,
  /^[ \t]*(?:```|~~~)/m,
  /^[ \t]*>[ \t]*(?:\[![A-Za-z]+\]|\S)/m,
  CHECKLIST_START,
  CHART_START,
  /^[ \t]*[-+*][ \t]+\[[ xX]\][ \t]+/m,
  /^[ \t]*[-+*][ \t]+\S/m,
  /^[ \t]*\d+[.)][ \t]+\S/m,
  /^[ \t]*(?:---+|\*\*\*+|___+)[ \t]*$/m,
  /^\s*\|.+\|\s*\n\s*\|[\s:|-]+\|/m,
  /^\s*\$\$[\s\S]+?\$\$/m,
  /:::youtube\s*\{[^}]+\}\s*:::/,
  /\*\*[^*\n]+\*\*/,
  /~~[^~\n]+~~/,
  /(?<!=)==(?!=|\s)[^\n=]+(?<!\s|=)==(?!=)/,
  /(?<!\+)\+\+(?!\+|\s)[^\n+]+(?<!\s|\+)\+\+(?!\+)/,
  /`[^`\n]+`/,
  /!?\[[^\]]*\]\([^)\s]+(?:\s+["'][^"']+["'])?\)/,
  MARK_TAG_START,
  SPAN_TAG_START,
]

/**
 * Determines whether a plain-text clipboard payload contains Markdown/MDX syntax
 * worth parsing through `MarkdownManager` rather than inserting as literal text.
 */
export function looksLikeMarkdown(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (BARE_YOUTUBE_URL.test(trimmed)) return false

  return MARKDOWN_DETECTION_PATTERNS.some((pattern) => pattern.test(text))
}
