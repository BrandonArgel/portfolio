import type { HighlightDecoration } from '@tanstack/highlight/core'

export type LineAnnotationKind = 'normal' | 'highlight' | 'add' | 'remove'

interface CodeBlockMeta {
  title: string
  highlight: string
  add: string
  remove: string
  startLine: number
  lineNumbers: boolean
}

interface ParsedCodeFenceInfo extends CodeBlockMeta {
  language: string
}

const MAX_RANGE_EXPANSION = 10_000

const EXTENSION_LANGUAGE_MAP: Readonly<Record<string, string>> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  py: 'python',
  pyw: 'python',
  html: 'html',
  htm: 'html',
  css: 'css',
  json: 'json',
  jsonc: 'json',
  md: 'markdown',
  mdx: 'markdown',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  sql: 'sql',
  rs: 'rust',
  go: 'go',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',
  c: 'c',
  h: 'c',
  cs: 'csharp',
  java: 'java',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  dockerfile: 'dockerfile',
  txt: 'plaintext',
}

const EXACT_FILENAME_LANGUAGE_MAP: Readonly<Record<string, string>> = {
  dockerfile: 'dockerfile',
  '.bashrc': 'bash',
  '.zshrc': 'bash',
  '.bash_profile': 'bash',
  '.profile': 'bash',
}

export function normalizeStartLine(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value.trim())
        ? Number.parseInt(value.trim(), 10)
        : Number.NaN

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

export function inferLanguageFromFilename(filename: string): string | null {
  const trimmed = filename.trim()
  if (!trimmed) return null

  const normalizedPath = trimmed.replace(/\\/g, '/')
  const basename = normalizedPath.slice(normalizedPath.lastIndexOf('/') + 1).toLowerCase()
  if (!basename) return null

  const exactMatch = EXACT_FILENAME_LANGUAGE_MAP[basename]
  if (exactMatch) return exactMatch

  if (basename.startsWith('dockerfile.')) {
    return 'dockerfile'
  }

  const lastDot = basename.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === basename.length - 1) {
    return null
  }

  const ext = basename.slice(lastDot + 1)
  return EXTENSION_LANGUAGE_MAP[ext] ?? null
}

export function parseLineRanges(input: string | null | undefined): number[] {
  if (!input?.trim()) return []

  const lines = new Set<number>()

  for (const rawPart of input.split(',')) {
    const part = rawPart.trim()
    if (!part) continue

    const match = /^(\d+)(?:-(\d+))?$/.exec(part)
    if (!match) continue

    const start = Number.parseInt(match[1], 10)
    const end = match[2] ? Number.parseInt(match[2], 10) : start

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 1 ||
      end < start ||
      end - start > MAX_RANGE_EXPANSION
    ) {
      continue
    }

    for (let line = start; line <= end; line += 1) {
      lines.add(line)
    }
  }

  return [...lines].sort((a, b) => a - b)
}

export function formatLineRanges(lines: Iterable<number>): string {
  const sorted = [...new Set(lines)]
    .filter((line) => Number.isSafeInteger(line) && line >= 1)
    .sort((a, b) => a - b)

  if (sorted.length === 0) return ''

  const ranges: string[] = []
  let rangeStart = sorted[0]
  let rangeEnd = sorted[0]

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]
    if (current === rangeEnd + 1) {
      rangeEnd = current
    } else {
      ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`)
      rangeStart = current
      rangeEnd = current
    }
  }

  ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`)
  return ranges.join(',')
}

export function getLineAnnotationMap(
  annotations: Pick<CodeBlockMeta, 'highlight' | 'add' | 'remove'>,
): Map<number, Exclude<LineAnnotationKind, 'normal'>> {
  const map = new Map<number, Exclude<LineAnnotationKind, 'normal'>>()

  for (const line of parseLineRanges(annotations.highlight)) {
    map.set(line, 'highlight')
  }
  for (const line of parseLineRanges(annotations.add)) {
    map.set(line, 'add')
  }
  for (const line of parseLineRanges(annotations.remove)) {
    map.set(line, 'remove')
  }

  return map
}

export function cycleLineAnnotation(
  line: number,
  current: Pick<CodeBlockMeta, 'highlight' | 'add' | 'remove'>,
): Pick<CodeBlockMeta, 'highlight' | 'add' | 'remove'> {
  if (!Number.isSafeInteger(line) || line < 1) {
    return {
      highlight: formatLineRanges(parseLineRanges(current.highlight)),
      add: formatLineRanges(parseLineRanges(current.add)),
      remove: formatLineRanges(parseLineRanges(current.remove)),
    }
  }

  const highlightSet = new Set(parseLineRanges(current.highlight))
  const addSet = new Set(parseLineRanges(current.add))
  const removeSet = new Set(parseLineRanges(current.remove))

  let currentState: LineAnnotationKind = 'normal'
  if (removeSet.has(line)) currentState = 'remove'
  else if (addSet.has(line)) currentState = 'add'
  else if (highlightSet.has(line)) currentState = 'highlight'

  highlightSet.delete(line)
  addSet.delete(line)
  removeSet.delete(line)

  switch (currentState) {
    case 'normal':
      highlightSet.add(line)
      break
    case 'highlight':
      addSet.add(line)
      break
    case 'add':
      removeSet.add(line)
      break
    case 'remove':
      break
  }

  return {
    highlight: formatLineRanges(highlightSet),
    add: formatLineRanges(addSet),
    remove: formatLineRanges(removeSet),
  }
}

function pushGroupedDecorations(
  rangeString: string,
  className: string,
  decorations: HighlightDecoration[],
) {
  const sorted = parseLineRanges(rangeString)
  if (sorted.length === 0) return

  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]
    if (current === end + 1) {
      end = current
    } else {
      decorations.push({
        className,
        lines: start === end ? start : [start, end],
      })
      start = current
      end = current
    }
  }

  decorations.push({
    className,
    lines: start === end ? start : [start, end],
  })
}

export function buildLineDecorations(
  annotations: Pick<CodeBlockMeta, 'highlight' | 'add' | 'remove'>,
): HighlightDecoration[] {
  const decorations: HighlightDecoration[] = []
  pushGroupedDecorations(annotations.highlight, 'th-line--highlighted', decorations)
  pushGroupedDecorations(annotations.add, 'th-line--inserted', decorations)
  pushGroupedDecorations(annotations.remove, 'th-line--deleted', decorations)
  return decorations
}

const FENCE_TOKEN_REGEX =
  /([A-Za-z_][\w-]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|\{([^}]*)\}|([^\s}]+))|\{([\d,\s-]+)\}|\b(lineNumbers|showLineNumbers|noLineNumbers)\b/g

function unescapeQuotedValue(raw: string): string {
  return raw.replace(/\\(["'\\])/g, '$1')
}

export function parseCodeFenceMeta(meta: string | null | undefined): CodeBlockMeta {
  const defaults: CodeBlockMeta = {
    title: '',
    highlight: '',
    add: '',
    remove: '',
    startLine: 1,
    lineNumbers: true,
  }

  if (!meta?.trim()) {
    return defaults
  }

  const highlightLines: number[] = []
  const addLines: number[] = []
  const removeLines: number[] = []
  let hasTitle = false
  let title = ''
  let startLine = 1
  let lineNumbers = true

  for (const match of meta.matchAll(FENCE_TOKEN_REGEX)) {
    const key = match[1]?.toLowerCase()
    const rawValue =
      match[2] !== undefined
        ? unescapeQuotedValue(match[2])
        : match[3] !== undefined
          ? unescapeQuotedValue(match[3])
          : (match[4] ?? match[5] ?? '')

    if (key) {
      if (
        (key === 'title' || key === 'filename' || key === 'file' || key === 'name') &&
        !hasTitle
      ) {
        const cleanTitle = rawValue.trim()
        if (cleanTitle) {
          title = cleanTitle
          hasTitle = true
        }
      } else if (key === 'highlight') {
        highlightLines.push(...parseLineRanges(rawValue))
      } else if (key === 'add' || key === 'ins') {
        addLines.push(...parseLineRanges(rawValue))
      } else if (key === 'remove' || key === 'del') {
        removeLines.push(...parseLineRanges(rawValue))
      } else if (key === 'startline' || key === 'start') {
        startLine = normalizeStartLine(rawValue)
      } else if (key === 'linenumbers' || key === 'showlinenumbers') {
        lineNumbers = rawValue.trim().toLowerCase() !== 'false'
      }
      continue
    }

    if (match[6]) {
      highlightLines.push(...parseLineRanges(match[6]))
      continue
    }

    if (match[7]) {
      lineNumbers = match[7] !== 'noLineNumbers'
    }
  }

  return {
    title,
    highlight: formatLineRanges(highlightLines),
    add: formatLineRanges(addLines),
    remove: formatLineRanges(removeLines),
    startLine,
    lineNumbers,
  }
}

export function parseCodeFenceInfo(info: string | null | undefined): ParsedCodeFenceInfo {
  const trimmed = info?.trim() ?? ''
  if (!trimmed) {
    return {
      language: '',
      ...parseCodeFenceMeta(''),
    }
  }

  const startsWithMetaOnly =
    trimmed.startsWith('{') ||
    /^(?:title|filename|file|name|highlight|add|ins|remove|del|startLine|start|lineNumbers|showLineNumbers|noLineNumbers)(?:=|\s|$)/i.test(
      trimmed,
    )

  if (startsWithMetaOnly) {
    return {
      language: '',
      ...parseCodeFenceMeta(trimmed),
    }
  }

  const firstWhitespace = trimmed.search(/\s/)
  if (firstWhitespace === -1) {
    return {
      language: trimmed,
      ...parseCodeFenceMeta(''),
    }
  }

  const language = trimmed.slice(0, firstWhitespace)
  const metaString = trimmed.slice(firstWhitespace + 1).trim()

  return {
    language,
    ...parseCodeFenceMeta(metaString),
  }
}

export function serializeCodeFenceInfo(attrs: {
  language?: string | null
  title?: string | null
  highlight?: string | null
  add?: string | null
  remove?: string | null
  startLine?: unknown
  lineNumbers?: boolean | null
}): string {
  const language = attrs.language?.trim() ?? ''
  const title = attrs.title?.trim() ?? ''
  const highlight = formatLineRanges(parseLineRanges(attrs.highlight))
  const add = formatLineRanges(parseLineRanges(attrs.add))
  const remove = formatLineRanges(parseLineRanges(attrs.remove))
  const startLine = normalizeStartLine(attrs.startLine)
  const lineNumbers = attrs.lineNumbers !== false

  const metaParts: string[] = []

  if (title) {
    const escapedTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    metaParts.push(`title="${escapedTitle}"`)
  }
  if (highlight) {
    metaParts.push(`highlight="${highlight}"`)
  }
  if (add) {
    metaParts.push(`add="${add}"`)
  }
  if (remove) {
    metaParts.push(`remove="${remove}"`)
  }
  if (startLine > 1) {
    metaParts.push(`startLine="${startLine}"`)
  }
  if (!lineNumbers) {
    metaParts.push('lineNumbers="false"')
  }

  if (metaParts.length === 0) {
    return language
  }

  // CommonMark treats the first word after ``` as the language and subsequent tokens as meta.
  const leadingLang = language || 'text'
  return `${leadingLang} ${metaParts.join(' ')}`
}
